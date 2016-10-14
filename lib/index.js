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
        defaultContentType : Joi.string().valid(_.values(config.contentType)),
        swagger : Joi.object().keys({
            title : Joi.string(),
            version : Joi.string().optional().default(""),
            description : Joi.string().optional().default(""),
            schemes : Joi.array().items(Joi.string().valid(config.validSchemes)).min(1),
            host : Joi.string(),
            basePath : Joi.string().optional().default("")
        }).optional()
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

            if(_.isUndefined(route.contentType)) {
                list[index].contentType = obj.options.defaultContentType;
            }


            if(route.contentType!=config.contentType.multipart && ! _.isUndefined(route.validate.files)) {
                throw new Error("contentType is invalid for files");
            }

            switch (route.contentType) {

                case "application/json" :
                    app[route.method](route.path,bodyParser.json());
                    break;

                case "application/x-www-form-urlencoded" :
                    app[route.method](route.path,bodyParser.urlencoded({ extended : true}));
                    break;

                case "multipart/form-data" :
                    var fileFields = _.map(route.validate.files,function(fileRules,fileName) {
                        return{ name: fileName, maxCount: 1 };
                    });
                    app[route.method](route.path,uploads.fields(fileFields));
                    break;

            }

            app[route.method](route.path,validation(route.validate),route.handler);
        });

        documentation(app,router.routes,obj.options.swagger);
    };

    return obj;
};

exports.router = router.init;
