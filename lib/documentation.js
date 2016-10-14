/**
 * Created by Tabish Rizvi.
 * Github :  https://github.com/TabishRizvi
 * Email : sayyidtabish@gmail.com
 */

"use strict";

var fs = require("fs-extra"),
    _ = require("underscore");

var config = require("../config");

module.exports = function(app,routes,options) {

    if(!options) {

        if(fs.existsSync("./public")) {
            fs.removeSync("./public/swagger");
            fs.removeSync("./public/swagger.json");
        }
        return;
    }

    if(!fs.existsSync("./public")) {

        fs.mkdirSync("./public");

        fs.copySync(__dirname+"/../swagger","./public/swagger");
    }
    else {
        if(!fs.existsSync("./public/swagger")) {
            fs.copySync(__dirname+"/../swagger","./public/swagger");
        }
    }

    var swaggerJson = {
        "swagger": "2.0",
        "info": {
            "version": options.version,
            "title": options.title,
            "description": options.description
        },
        "host": options.host,
        "basePath": options.basePath,
        "schemes": options.schemes,
        "paths":{}
    };

    _.each(routes,function(route){

        route.path = swaggifyPath(route.path);
        if(_.isUndefined(swaggerJson.paths[route.path])) {
            swaggerJson.paths[route.path] = {};
        }

        swaggerJson.paths[route.path][route.method] = {
            consumes : [config.contentType[route.contentType]]
        };

        var parameters = [];

        if(route.contentType=="json") {

            if(! _.isUndefined(route.validate.body)) {

                parameters  = _.union(parameters,createSchema(route.contentType,"body",route));
            }
        }

        else if(route.contentType=="urlencoded"){
            if(! _.isUndefined(route.validate.body)) {

                parameters  = _.union(parameters,createSchema(route.contentType,"body",route));
            }
        }

        else {

            if(! _.isUndefined(route.validate.body)) {

                parameters  = _.union(parameters,createSchema(route.contentType,"body",route));
            }

            if(! _.isUndefined(route.validate.files)) {

                parameters  = _.union(parameters,createSchema(route.contentType,"files",route));
            }

        }

        if(! _.isUndefined(route.validate.query)) {

            parameters  = _.union(parameters,createSchema(route.contentType,"query",route));
        }

        if(! _.isUndefined(route.validate.params)) {

            parameters  = _.union(parameters,createSchema(route.contentType,"params",route));
        }

        if(! _.isUndefined(route.validate.headers)) {

            parameters  = _.union(parameters,createSchema(route.contentType,"headers",route));
        }

        swaggerJson.paths[route.path][route.method]["parameters"] = parameters;
    });




    fs.writeJSONSync("./public/swagger.json",swaggerJson);
};


function mapDataTypeJoiToSwagger(joiType) {

    var typeMapping = {
        'boolean': { 'type': 'boolean' },
        'binary': { 'type': 'string', 'format': 'binary' },
        'date': { 'type': 'string', 'format': 'date' },
        'number': { 'type': 'number' },
        'string': { 'type': 'string' },
        'any': { 'type': 'string' },
        'array': { 'type': 'array' },
        'func': { 'type': 'string' },
        'object': { 'type': 'object' },
        'alternatives': { 'type': 'alternatives' }

    };

    return typeMapping[joiType];
}

function mapParamTypeJoiToSwagger(joiType) {

    var typeMapping = {
        'query': "query",
        'params': "path",
        'headers': "header"
    };

    return typeMapping[joiType];
}

function createSchema (contentType,validateType,route) {

    var out = [];
    var obj;

    if(validateType=="body") {

        if(contentType=="json") {

            obj = {
                "name": "body",
                "in": "body",
                "description": "request body",
                "schema": {
                    "type": "object",
                    "required": [],
                    "properties": {}
                },
                "required": true
            };

            _.each(route.validate.body,function(param,paramName) {
                obj.schema.properties[paramName] = mapDataTypeJoiToSwagger(param._type);

                if(param._valids._set.length!=0) {
                    obj.schema.properties[paramName]["enum"] =  param._valids._set;
                }

                if(_.isUndefined(param._flags.presence) || param._flags.presence=="required") {
                    obj.schema.required.push(paramName);
                }
            });

            out.push(obj);
        }
        else {



            _.each(route.validate.body,function(param,paramName) {

                obj = {
                    "in": "formData"
                };

                obj.name = obj.description = paramName;

                obj = _.extend(obj, mapDataTypeJoiToSwagger(param._type));

                if(param._valids._set.length!=0) {
                    obj.enum =  param._valids._set;
                }

                obj.required = _.isUndefined(param._flags.presence) || param._flags.presence=="required";

                out.push(obj);
            });
        }
    }
    else if(validateType=="files") {


        _.each(route.validate.files,function(param,paramName) {

            obj = {
                "in": "formData"
            };
            obj.name = obj.description = paramName;
            obj.type = "file";


            obj.required = !param.optional;

            out.push(obj);
        });
    }
    else {


        _.each(route.validate[validateType],function(param,paramName) {

            obj = {
                "in": mapParamTypeJoiToSwagger(validateType)
            };

            obj.name = obj.description = paramName;
            obj = _.extend(obj, mapDataTypeJoiToSwagger(param._type));

            if(param._valids._set.length!=0) {
                obj.enum =  param._valids._set;
            }

            obj.required = _.isUndefined(param._flags.presence) || param._flags.presence=="required";

            out.push(obj);

        });
    }

    return out;
}


function swaggifyPath(path) {

    String.prototype.splice = function(idx, rem, str) {
        return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
    };

    for(var i=0;i<path.length;i++) {

        if(path.charAt(i)==":") {

            for(var j=i+1;j<path.length;j++) {

                if(path.charAt(j)=="/") {
                    break;
                }
            }

            path = path.splice(i,1,"{");
            path = path.splice(j,0,"}")
        }
    }

    return path;
}
