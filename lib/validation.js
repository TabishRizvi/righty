/**
 * Created by Tabish Rizvi.
 * Github :  https://github.com/TabishRizvi
 * Email : sayyidtabish@gmail.com
 */

"use strict";

var Joi = require("joi"),
    _ = require("underscore");

module.exports = function (validate) {

    return function (req,res,next) {

        var errorMsg = "";
        var pass = _.every(validate,function(el,paramType) {

            var result;
            if(paramType!="files") {

                if(paramType=="headers") {

                    var temp = {};

                    _.each(el,function(joiRules,headerKey) {
                        temp[headerKey.toLowerCase()] = joiRules;
                    });

                    el = temp;

                }
                result = Joi.validate(req[paramType],el,{
                    presence : "required",
                    allowUnknown : true
                });

                if(result.error) {
                    errorMsg =  result.error.details[0].message.replace(/["]/ig, '');
                }
                return result.error==null;
            }
            else {

                result = _.every(el,function(fileProp,fileName) {

                    if(! compareMimeTypes(fileProp.mimetype,req.files[fileName].mimetype)) {
                        errorMsg =  "mime-type of "+fileName+" is incorrect";
                        return false;
                    }

                    if(req.files[fileName].size>fileProp.size) {
                        errorMsg =  "size of "+fileName+" exceeds maximum limit";
                        return false;
                    }

                    return true;
                });

                return result;
            }
        });


        if(pass) {
            next();
        }
        else {
            res.status(400).send({
                message : "Bad request",
                err : errorMsg
            });
        }
    }
};


function  compareMimeTypes(validMimeTypes,mimeType) {

    if(validMimeTypes.indexOf("*/*")!=-1) {
        return true;
    }

    var mainType = mimeType.split("/")[0];

    if(validMimeTypes.indexOf(mainType+"/*")!=-1) {
        return true;
    }

    return validMimeTypes.indexOf(mimeType)!=-1;
}