/**
 * Created by Tabish Rizvi.
 * Github :  https://github.com/TabishRizvi
 * Email : sayyidtabish@gmail.com
 */

"use strict";

var _ = require("underscore");

var router = require("./router"),
    validation = require("./validation"),
    documentation = require("./documentation");

exports = module.exports = function(options) {

    function func () {

    }


    func.options = options || {};
    func.use = function(app,router) {

        if(! router.righty) {
            throw new Error("Invalid router");
        }
        _.each(router.routes,function (route) {
            app[route.method](route.path,validation(route.validate),route.handler);
        });

        documentation(app,router,{
            title : "demo title",
            version : "demo version",
            description : "demo description"
        });
    };

    return func;
};

exports.router = router.init;
