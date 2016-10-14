/**
 * Created by Tabish Rizvi.
 * Github :  https://github.com/TabishRizvi
 * Email : sayyidtabish@gmail.com
 */

"use strict";

module.exports.contentType = {

    json : "application/json",
    urlencoded : "application/x-www-form-urlencoded",
    multipart : "multipart/form-data"
};

module.exports.validSchemes =  [
    "http",
    "https"
];

module.exports.validHttpMethods = ["get","post","put","delete","options","patch","head"];
