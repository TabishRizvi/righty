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

                result = Joi.validate(req[paramType],el);

                errorMsg =  result.error;
                return result.error==null;
            }
            else {

                result = _.every(el,function(fileProp,fileName) {

                    if(fileProp.mimetype!="*/*" && req.files[fileName].mimetype!=fileProp.mimetype) {
                        errorMsg =  "mime-type of "+fileName+"is incorrect";
                        return false;
                    }

                    if(req.files[fileName].size>fileProp.size) {
                        errorMsg =  "size of "+fileName+"exceeds maximum limit";
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