/**
 * Created by Tabish Rizvi.
 * Github :  https://github.com/TabishRizvi
 * Email : sayyidtabish@gmail.com
 */

"use strict";

var Joi = require("joi"),
    async = require("async");

module.exports = function (validate) {

    return function (req,res,next) {

        async.forEachOf(validate,function (el,paramType,cb) {

            Joi.validate(req[paramType], el , {
                presence: "required",
                allowUnknown : false
            }, function (err) {
                if (err) {

                    cb(err.details[0].message.replace(/["]/ig, ""));

                }
                else{
                    cb(null);
                }
            });
        },function (err) {
            if(err) {
                res.status(400).send({
                    message : "Bad request",
                    err : err
                });
            }
            else {
                next();
            }
        });
    }
};