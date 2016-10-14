![Righty Logo](https://s11.postimg.org/z5q72649v/righty_logo.png)]

The *RIGHT* way to configure routes in [express.js](https://github.com/expressjs/express)

# **`righty`**

![NPM](https://nodei.co/npm/righty.png?downloadRank=true&stars=true)](https://nodei.co/npm/righty/)


## The *RIGHT* way to configure routes in [express.js](https://github.com/expressjs/express)


## Installation

```sh
npm install async-straight
```

## API


```js
var straight = require('async-straight')
```

### straight(tasks, [callback])

It executes each function in `tasks` in series and after their execution calls the optional `callback`(if supplied).

__Arguments__

* `tasks` - An array or object containing functions to run, each function is passed
  a `cb(err, result)` it must call on completion with an error `err` (which can
  be `null`) and an optional `result` value.
* `callback(err, results)` - An optional callback to run once all the functions
  have completed. This function gets a results array (or object) containing all
  the result arguments passed to the `task` callbacks.


__Example__

```js
straight([
   function(cb) {
      setTimeout(function() {
         cb(null, "hello");
      }, 1000);
   },
   function(cb) {
      setTimeout(function() {
         cb(null, "world");
      }, 2000);
   }
], function(err, result) {
   // result is equal to ["hello","world"]
});

// an example using an object instead of an array
straight({
    one: function(cb){
        setTimeout(function(){
            cb(null, "ping");
        }, 200);
    },
    two: function(callback){
        setTimeout(function(){
            cb(null, "pong");
        }, 100);
    }
},
function(err, results) {
    // results is now equal to: {one: "ping", two: "pong"}
});
```
## Tests

```js
npm run test
```

## Author

**Tabish Rizvi (<a href="mailto:sayyidtabish@gmail.com">sayyidtabish@gmail.com</a>)**

## License

**MIT**