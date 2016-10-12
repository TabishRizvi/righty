/**
 * Created by Tabish Rizvi.
 * Github :  https://github.com/TabishRizvi
 * Email : sayyidtabish@gmail.com
 */

"use strict";

var _ = require("underscore"),
    path = require("path");


module.exports.init = function() {


    function func(options) {

        this.options = options;
        this.routes = [];
        this.righty = true;

        this.add = function() {

            if(arguments.length==1) {

                if(_.isArray(arguments[0])) {

                    for(var i=0;i<arguments[0].length;i++) {
                        if(!validateRouteMapping(arguments[0][i])){
                            break;
                        }
                    }

                    if(i!=arguments[0].length) {
                        throw new Error("Invalid route mapping");
                    }
                    this.routes =  [].concat(this.routes,arguments[0]);
                    return;
                }

                if(_.isObject(arguments[0])) {

                    if(!validateRouteMapping(arguments[0])){
                        throw new Error("Invalid route mapping");
                    }

                    this.routes.push(arguments[0]);
                    return;
                }


            }

            if(arguments.length==2) {

                if(! _.isString(arguments[0]) || ! arguments[1].righty) {
                    throw new Error("Invalid argument");
                }

                this.routes = _.map(arguments[1].routes,function(el){

                    el.path = path.join(arguments[0],el.path);
                    return el;
                })
            }

            throw new Error("Invalid number of arguments");

        }
    }

    return func;
};


function validateRouteMapping(routeMapping) {

    var schema = Joi.object().keys({

        path: Joi.string(),
        method : Joi.any().string().lowercase().valid("get","post","put","delete","options","patch","head"),
        validate : Joi.object().keys({
            body : Joi.object().optional(),
            query : Joi.object().optional(),
            params : Joi.object().optional(),
            headers : Joi.object().optional()
        }).optional(),
        handler : Joi.func()

    });

    var result = Joi.validate(routeMapping, schema , {
        presence: "required",
        allowUnknown : false
    });

    return result.error==null;
}