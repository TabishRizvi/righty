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
  

## API

### Righty

  Exposed by `require('righty')`.
  
### Righty(options)

Creates a new Righty instance.
  
```js  

var Righty = require("righty")({
    defaultContentType : "json",
    swagger : {
        title : "Demo app",
        version : "v1",
        description : "Swagger docs for demo app. Generated using `righty`",
        schemes : ["http"],
        host : "localhost:3000"
    }
});      
  
```

#### options

An `options` object containing following keys has to be passed to instantiate Righty:

- `defaultContentType` -  The content types to be used for routes, for which content type is explicitly mentioned. Supported content types (for now) : "json", "urlencoded" and "multipart"

- `swagger` -  an optional object specifying swagger configuration. If omitted, documentation will not be generated. It may contain following keys:
    - `title` - title of the  documentation. **_Required_** 
    - `version` - version of the  documentation. **_Required_** 
    - `description` - description of the  documentation. **_Optional_** 
    - `schemes` - 	The transfer protocol of the API. Values MUST be from the list: "http", "https", "ws", "wss". If the schemes is not included, the default scheme to be used is the one used to access the Swagger definition itself. **_Optional_**  
    - `host` - The host (name or ip) serving the API. This MUST be the host only and does not include the scheme nor sub-paths. It MAY include a port. If the host is not included, the host serving the documentation is to be used (including the port) . **_Optional_**  
  

### Righty.use(app,router)

It mounts `Righty` router (see below) to express app.

### Righty.Router()

Creates a new Righty router instance

```js  

var router = require("righty").Router();     
  
```

### router.add(routeMapping)

It mounts route(s) to a `Righty` router instance. It takes `routeMapping` as a single argument. `routeMapping` can be an object or an array of similar objects.

#### routeMapping 

A `routeMapping` object contains following keys:

- path - Route path as used in Express. **_Required_** 
- method - HTTP method of the request, such as GET, PUT, POST, and so on, in lowercase. **_Required_** 
- contentType - The content type to be associated with the route. If omitted, defaultContentType is used. **_Optional_** 
- handler - standard express middleware to be called to generate the response after successful body parsing and validation. **_Required_** 
- validate - Object containing validation rules. **_Optional_**
  - body - Joi schema object. **_Optional_**
  - query - Joi schema object. **_Optional_**
  - params - Joi schema object. **_Optional_**
  - headers - Joi schema object. **_Optional_**
  - files - object containing file names as keys and filePropSchema (see below) as values. **_Optional_**
 
##### filePropSchema

It is an object containing file validation rules:
- mimetype - an array of mime-types to be used as filter for the file. Patterns like "*/*", "image/*", etc. are accepted. **_Required_**
- size - Maximum size allowed for files in bytes. **_Optional_**

Example where `routeMapping` is an object: 

```js  

var router = require("righty").Router();   
  
var controllers = require("../controllers);  

var routeMapping = {
            path : "/profile/:id",
            method : "put",
            validate : {
                body : {
                    name : Joi.string(),
                    gender : Joi.any().valid("m","f")
                },
                headers : {
                    "x-authorization" : Joi.string()
                },
                query : {
                    askForAcknowledgement : Joi.number().valid(0,1),
                },
                params : {
                    id : Joi.number().integer()
                },
                files : {
                    pic : {
                        mimetype : ["image/*"],
                        size : 50000
                    }
                }
            },
            contentType : "multipart",
            handler : controllers.ProfileUpdateCtrl
};

router.add(routeMapping);

module.exports = router;
  
```

Example where `routeMapping` is an array: 

```js  

var router = require("righty").Router();   
  
var controllers = require("../controllers);  

var routeMapping = [
    {
            path : "/profile/:id",
            method : "put",
            validate : {
                body : {
                    name : Joi.string(),
                    gender : Joi.any().valid("m","f")
                },
                headers : {
                    "x-authorization" : Joi.string()
                },
                query : {
                    askForAcknowledgement : Joi.number().valid(0,1),
                },
                params : {
                    id : Joi.number().integer()
                },
                files : {
                    pic : {
                        mimetype : ["image/*"],
                        size : 50000
                    }
                }
            },
            contentType : "multipart",
            handler : controllers.ProfileUpdateCtrl
    },
    {
                path : "/profile/:id",
                method : "get",
                validate : {
                    params : {
                        id : Joi.number().integer()
                    }
                },
                handler : controllers.ProfileViewCtrl
        }
    
];

router.add(routeMapping);

module.exports = router;
  
```

### router.add(basePath,subRouter)

An alternate version of router.add() to facilitate hierarchical routing. `subRouter` is a normal Righty router  and `basePath` is the path prepended to all the routes in subRouter.

## Quick Start

```js

var express = require('express');
var app = express();
var Joi = require("joi");

var router = require("righty").Router();    // router instance

var Righty = require("righty")({
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
                data : Joi.string().max(250)
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

Righty.use(app,router);          // attach router to app

app.listen(3000);


```

## People

The original author of `righty` is [Tabish Rizvi](https://github.com/TabishRizvi)

I am looking for collaborators for this project. Anyone interested can mail be at [sayyidtabish@gmail.com](mailto:sayyidtabish@gmail.com)

## License

  [MIT](LICENSE)