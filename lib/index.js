/**
 * Created by Tabish Rizvi.
 * Github :  https://github.com/TabishRizvi
 * Email : sayyidtabish@gmail.com
 */

"use strict";

var _ = require("underscore"),
    Joi = require("joi");

var router = require("./router"),
    validation = require("./validation");

exports = module.exports = function() {

    function func (options) {

    }


    func.options = options || {};
    func.use = function(app,router) {

        if(! router.righty) {
            throw new Error("Invalid router");
        }
        _.each(router.routes,function (route) {
            app[route.method](route.path,validation(route.validate),route.handler);
        });
    }

    return func;
};

exports.router = router.init;
