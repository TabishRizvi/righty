/**
 * Created by Tabish Rizvi.
 * Github :  https://github.com/TabishRizvi
 * Email : sayyidtabish@gmail.com
 */

"use strict";

var fs = require("fs-extra"),
    _ = require("underscore");

module.exports = function(app,routes,options) {

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

                var bodyObj = {
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

                _.each(route.validate.body,function(paramName,param) {
                    bodyObj.schema.properties[paramName] = mapJoiToSwagger(param._type);

                    if(param._valids._set.length!=0) {
                        bodyObj.schema.properties[paramName]["enum"] =  param._valids._set;
                    }

                    if(_.isUndefined(param._flags.presence) || param._flags.presence=="required") {
                        bodyObj.schema.required.push(paramName);
                    }
                });

                swaggerJson.paths[route.path][route.method].parameters.push(bodyObj);
            }
        }

        else if(route.contentType=="application/x-www-form-urlencoded"){
            if(! _.isUndefined(route.validate.body)) {

                var bodyObj = {
                    "in": "formData"
                };

                _.each(route.validate.body,function(paramName,param) {
                    bodyObj.name = bodyObj.description = paramName;

                    bodyObj = _.extend(bodyObj, mapJoiToSwagger(param._type));

                    if(param._valids._set.length!=0) {
                        bodyObj.enum =  param._valids._set;
                    }

                    bodyObj.required = _.isUndefined(param._flags.presence) || param._flags.presence=="required";

                });

                swaggerJson.paths[route.path][route.method].parameters.push(bodyObj);
            }
        }

        else {

            if(! _.isUndefined(route.validate.body)) {

                var bodyObj = {
                    "in": "formData"
                };

                _.each(route.validate.body,function(paramName,param) {
                    bodyObj.name = bodyObj.description = paramName;

                    bodyObj = _.extend(bodyObj, mapJoiToSwagger(param._type));

                    if(param._valids._set.length!=0) {
                        bodyObj.enum =  param._valids._set;
                    }

                    bodyObj.required = _.isUndefined(param._flags.presence) || param._flags.presence=="required";

                });

                swaggerJson.paths[route.path][route.method].parameters.push(bodyObj);
            }

            if(! _.isUndefined(route.validate.files)) {

                var bodyObj = {
                    "in": "formData"
                };

                _.each(route.validate.body,function(paramName,param) {
                    bodyObj.name = bodyObj.description = paramName;
                    bodyObj.type = "file";


                    bodyObj.required = !param.optional;

                });

                swaggerJson.paths[route.path][route.method].parameters.push(bodyObj);
            }

        }



        if(! _.isUndefined(route.validate.query)) {

            var queryObj = {
                "in": "query"
            };

            _.each(route.validate.query,function(paramName,param) {
                queryObj.name = queryObj.description = paramName;

                queryObj = _.extend(queryObj, mapJoiToSwagger(param._type));

                if(param._valids._set.length!=0) {
                    queryObj.enum =  param._valids._set;
                }

                queryObj.required = _.isUndefined(param._flags.presence) || param._flags.presence=="required";

            });

            swaggerJson.paths[route.path][route.method].parameters.push(queryObj);
        }

        if(! _.isUndefined(route.validate.params)) {

            var paramObj = {
                "in": "path"
            };

            _.each(route.validate.params,function(paramName,param) {
                paramObj.name = paramObj.description = paramName;
                paramObj = _.extend(paramObj, mapJoiToSwagger(param._type));

                if(param._valids._set.length!=0) {
                    paramObj.enum =  param._valids._set;
                }

                paramObj.required = _.isUndefined(param._flags.presence) || param._flags.presence=="required";

            });

            swaggerJson.paths[route.path][route.method].parameters.push(paramObj);
        }

        if(! _.isUndefined(route.validate.headers)) {

            var headerObj = {
                "in": "header"
            };

            _.each(route.validate.headers,function(paramName,param) {
                headerObj.name = headerObj.description = paramName;
                headerObj = _.extend(headerObj, mapJoiToSwagger(param._type));

                if(param._valids._set.length!=0) {
                    headerObj.enum =  param._valids._set;
                }

                headerObj.required = _.isUndefined(param._flags.presence) || param._flags.presence=="required";

            });

            swaggerJson.paths[route.path][route.method].parameters.push(headerObj);
        }

    });


    fs.writeJSONSync("./public/swagger.json",swaggerJson);
};


function mapJoiToSwagger(joiType) {

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
