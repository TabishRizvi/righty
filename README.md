![Righty Logo](https://s11.postimg.org/z5q72649v/righty_logo.png)

A clean,fast,efficient and the *RIGHT* way to configure routes in express.js

[![NPM](https://nodei.co/npm/righty.png?downloadRank=true&stars=true)](https://www.npmjs.com/package/righty)


## Installation

```bash
$ npm install righty
```

## Features

  * Cleaner code
  * Configuration over code (inspired greatly from Hapi)
  * Validations using Joi
  * Automatic swagger documentation generation
  * Body parsing  support (json,urlencoded,multipart-formdata)

## Quick Start

```js

var express = require('express');
var app = express();
var Joi = require("joi");

var router = require("righty").router();    // router instance

var righty = require("righty")({
    defaultContentType : "json",
    swagger : {
        title : "Demo app",
        version : "v1",
        description : "Swagger docs for demo app. Generated using `righty`",
        schemes : ["http"],
        host : "localhost:3000"
    }
});                                       // righty instance

function SendMessageCtrl(req,res) {

    
    // req.body = > { data : "xyz"}
    
    res.send({
        message : "Sent"
    });
}

function ReceiveMessageCtrl(req,res) {

    res.send({
        message: "OK",
        data: ["Hi Foo", "Is Bar der?"]
    });
}


var routeMapping = [

    {
        path : "/message",
        method : "post",
        validate : {
            body : {
                data : Joi.string().max(25)
            }
        },
        handler : SendMessageCtrl
    },

    {
        path : "/message",
        method : "get",
        handler : ReceiveMessageCtrl
    }
];                           

router.add(routeMapping);           // add routes to router

app.use(express.static(__dirname+ '/public'));       // Note : You need to declare public directory as static if swagger documentation required

righty.use(app,router);          // attach router to app

app.listen(3000);


```

## People

The original author of `righty` is [Tabish Rizvi](https://github.com/TabishRizvi)

I am looking for collaborators for this project. Anyone interested can mail be at [sayyidtabish@gmail.com](mailto:sayyidtabish@gmail.com)

## License

  [MIT](LICENSE)