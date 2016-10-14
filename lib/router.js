/**
 * Created by Tabish Rizvi.
 * Github :  https://github.com/TabishRizvi
 * Email : sayyidtabish@gmail.com
 */

"use strict";

var _ = require("underscore"),
    Joi = require("joi"),
    path = require("path");

var config = require("../config");


module.exports.init = function() {

    var obj = {};

    obj.routes = [];
    obj.righty = true;

    obj.add = function() {

        if(arguments.length==1) {

            var _pass;
            if(_.isArray(arguments[0])) {

                for(var i=0;i<arguments[0].length;i++) {
                    _pass = validateRouteMapping(arguments[0][i]);
                    if(_pass!==true){
                        throw new Error(_pass);
                    }
                }

                this.routes =  [].concat(this.routes,arguments[0]);
                return;
            }

            if(_.isObject(arguments[0])) {

                _pass = validateRouteMapping(arguments[0]);
                if(_pass!==true){
                    throw new Error(_pass);
                }

                this.routes.push(arguments[0]);
                return;
            }


        }

        if(arguments.length==2) {

            if(! _.isString(arguments[0]) || ! arguments[1].righty) {
                throw new Error("Invalid argument");
            }

            var prefixPath = arguments[0];
            var routes = arguments[1].routes;

            this.routes = _.map(routes,function(el){
                el.path = path.join(prefixPath,el.path);
                return el;
            });
            return;
        }

        throw new Error("Invalid number of arguments");

    };

    return obj;
};

function validateRouteMapping(routeMapping) {

    var schema = Joi.object().keys({

        path: Joi.string(),
        method : Joi.string().lowercase().valid(config.validHttpMethods),
        validate : Joi.object().keys({
            body : Joi.object().optional(),
            query : Joi.object().optional(),
            params : Joi.object().optional(),
            headers : Joi.object().optional(),
            files : Joi.object().optional()
        }).optional(),
        contentType : Joi.string().valid(_.keys(config.contentType)).optional(),
        handler : Joi.func()

    });

    var result = Joi.validate(routeMapping, schema , {
        presence: "required",
        allowUnknown : false
    });

    if(result.error) {
        return result.error.details[0].message.replace(/["]/ig, '');
    }

    if(routeMapping.method!="post" && routeMapping.method!="put" &&  routeMapping.validate && (routeMapping.validate.body || routeMapping.validate.files)) {

        return "use POST or PUT to send body/files";
    }

    if(routeMapping.validate && routeMapping.validate.files) {

        var _result = _.every(routeMapping.validate.files,function(fileProp) {

            var filePropSchema = Joi.object().keys({
                mimetype : Joi.array().items(Joi.string()).min(1),
                size : Joi.number().integer().optional()
            });

            var pass = Joi.validate(fileProp,filePropSchema,{
                presence : "required",
                allowUnknown:false
            });

            if(pass.error) {
                return false;
            }

            return _.every(fileProp.mimetype,function(el){
                return el.split("/").length==2;
            });

        });

        if(!_result) {
            return "fileSchema is invalid";
        }
    }

    return true;
}