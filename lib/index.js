/**
 * Created by Tabish Rizvi.
 * Github :  https://github.com/TabishRizvi
 * Email : sayyidtabish@gmail.com
 */

"use strict";

var _ = require("underscore"),
    Joi = require("joi"),
    bodyParser = require("body-parser"),
    multer = require("multer"),
    os = require("os");

var config = require("../config"),
    router = require("./router"),
    validation = require("./validation"),
    documentation = require("./documentation");

var uploads = multer({ dest : os.tmpdir()});

exports = module.exports = function(options) {

    var optionsSchema = Joi.object().keys({
        defaultContentType : Joi.string().valid(_.keys(config.contentType)),
        swagger : Joi.object().keys({
            title : Joi.string(),
            version : Joi.string().default(""),
            description : Joi.string().optional().default(""),
            schemes : Joi.array().items(Joi.string().valid(config.validSchemes)).min(1).optional().default(""),
            host : Joi.string().optional().default(""),
            basePath : Joi.string().optional().default("")
        }).optional().default(false)
    });

    var result = Joi.validate(options,optionsSchema, {
        presence: "required",
        allowUnknown : false
    });

    if(result.error) {
        throw  new Error("Invalid options");
    }

    var obj = {};

    obj.options =  result.value;

    obj.use = function(app,router) {

        if(! router.righty) {
            throw new Error("Invalid router");
        }
        _.each(router.routes,function (route,index,list) {

            if(!route.contentType) {
                list[index].contentType = obj.options.defaultContentType;
            }


            if(route.contentType!="multipart" && route.validate &&  route.validate.files) {
                throw new Error("contentType is invalid for files");
            }

            switch (route.contentType) {

                case "json" :
                    app[route.method](route.path,bodyParser.json());
                    break;

                case "urlencoded" :
                    app[route.method](route.path,bodyParser.urlencoded({ extended : true}));
                    break;

                case "multipart" :

                    var uploadMiddleware;
                    if(route.validate && route.validate.files) {
                        var fileFields = _.map(route.validate.files,function(fileRules,fileName) {
                            return{ name: fileName, maxCount: 1 };
                        });
                        uploadMiddleware = uploads.fields(fileFields);
                    }
                    else {
                        uploadMiddleware = uploads.array();
                    }

                    app[route.method](route.path,uploadMiddleware,function(req,res,next) {

                        _.each(req.files,function(el,key,list){
                            list[key] = el[0];
                        });

                        next();
                    });
                    break;

            }

            app[route.method](route.path,validation(route.validate),route.handler);
        });

        documentation(app,router.routes,obj.options.swagger);
    };

    return obj;
};

exports.Router = router.init;
