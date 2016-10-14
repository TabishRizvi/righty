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

        if(_.isUndefined(swaggerJson.paths[route.path])) {
            swaggerJson.paths[route.path] = {};
        }

        swaggerJson.paths[route.path][route.method] = {

            parameters : [],
            consumes : [route.contentType]
        };

        if(route.contentType=="application/json") {

            if(! _.isUndefined(route.validate.body)) {

                swaggerJson.paths[route.path][route.method].parameters.push(createSchema(route.contentType,"body",route));
            }
        }

        else if(route.contentType=="application/x-www-form-urlencoded"){
            if(! _.isUndefined(route.validate.body)) {

                swaggerJson.paths[route.path][route.method].parameters.push(createSchema(route.contentType,"body",route));
            }
        }

        else {

            if(! _.isUndefined(route.validate.body)) {

                swaggerJson.paths[route.path][route.method].parameters.push(createSchema(route.contentType,"body",route));
            }

            if(! _.isUndefined(route.validate.files)) {

                swaggerJson.paths[route.path][route.method].parameters.push(createSchema(route.contentType,"files",route));
            }

        }

        if(! _.isUndefined(route.validate.query)) {

            swaggerJson.paths[route.path][route.method].parameters.push(createSchema(route.contentType,"query",route));
        }

        if(! _.isUndefined(route.validate.params)) {

            swaggerJson.paths[route.path][route.method].parameters.push(createSchema(route.contentType,"params",route));
        }

        if(! _.isUndefined(route.validate.headers)) {

            swaggerJson.paths[route.path][route.method].parameters.push(createSchema(route.contentType,"headers",route));
        }
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

    var obj;

    if(validateType=="body") {

        if(contentType==config.contentType.json) {

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
        }
        else {

            obj = {
                "in": "formData"
            };

            _.each(route.validate.body,function(param,paramName) {
                obj.name = obj.description = paramName;

                obj = _.extend(obj, mapDataTypeJoiToSwagger(param._type));

                if(param._valids._set.length!=0) {
                    obj.enum =  param._valids._set;
                }

                obj.required = _.isUndefined(param._flags.presence) || param._flags.presence=="required";

            });
        }
    }
    else if(validateType=="files") {
        obj = {
            "in": "formData"
        };

        _.each(route.validate.files,function(param,paramName) {
            obj.name = obj.description = paramName;
            obj.type = "file";


            obj.required = !param.optional;

        });
    }
    else {
        obj = {
            "in": mapParamTypeJoiToSwagger(validateType)
        };

        _.each(route.validate[validateType],function(param,paramName) {
            obj.name = obj.description = paramName;
            obj = _.extend(obj, mapDataTypeJoiToSwagger(param._type));

            if(param._valids._set.length!=0) {
                obj.enum =  param._valids._set;
            }

            obj.required = _.isUndefined(param._flags.presence) || param._flags.presence=="required";

        });
    }

    return obj;
}
