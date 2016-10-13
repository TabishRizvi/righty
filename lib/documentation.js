/**
 * Created by Tabish Rizvi.
 * Github :  https://github.com/TabishRizvi
 * Email : sayyidtabish@gmail.com
 */

"use strict";

var fs = require("fs-extra"),
    _ = require("underscore");

module.exports = function(app,routes,options) {

    if(!fs.existsSync("../../public")) {

        fs.mkdirSync("../../public");

        fs.copySync("../swagger","../../public/swagger");
    }
    else {
        if(!fs.existsSync("../../public/swagger")) {
            fs.copySync("../swagger","../../public/swagger");
        }
    }

    var swaggerJson = {
        "swagger": "2.0",
        "info": {
            "version": options.version,
            "title": options.title,
            "description": options.description
        },
        "host": "",
        "basePath": "",
        "schemes": [
            "http"
        ],
        "consumes": [
            "application/json"
        ],
        "produces": [
            "application/json"
        ],
        "paths":{}
    };

    _.each(routes,function(route){

        if(_.isUndefined(swaggerJson.paths[route.path])) {
            swaggerJson.paths[route.path] = {};
        }

        swaggerJson.paths[route.path][route.method] = {

            parameters : []
        };

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
                bodyObj.schema.properties[paramName] = {
                    type : mapJoiToSwagger(param._type)
                };

                if(param._valids._set.length!=0) {
                    bodyObj.schema.properties[paramName]["enum"] =  param._valids._set;
                }

                if(_.isUndefined(param._flags.presence) || param._flags.presence=="required") {
                    bodyObj.schema.required.push(paramName);
                }
            });

            swaggerJson.paths[route.path][route.method].parameters.push(bodyObj);
        }

        if(! _.isUndefined(route.validate.query)) {

            var queryObj = {
                "in": "query"
            };

            _.each(route.validate.query,function(paramName,param) {
                queryObj.name = queryObj.description = paramName;
                queryObj.type =  mapJoiToSwagger(param._type);

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
                paramObj.type =  mapJoiToSwagger(param._type);

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
                headerObj.type =  mapJoiToSwagger(param._type);

                if(param._valids._set.length!=0) {
                    headerObj.enum =  param._valids._set;
                }

                headerObj.required = _.isUndefined(param._flags.presence) || param._flags.presence=="required";

            });

            swaggerJson.paths[route.path][route.method].parameters.push(headerObj);
        }

    });


    fs.writeJSONSync("../../public/swagger.json",swaggerJson);
};
