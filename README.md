[![build status](https://secure.travis-ci.org/AndreasMadsen/configme.png)](http://travis-ci.org/AndreasMadsen/configme)
#configme

> configme is the simplest possible configuration module.
> There still make life easy for both user and creater.

## Features
 - search file tree for config.json
 - do not conflict with other modules by using namespace
 - allow manual input using object or filepath
 - support non-strict defaulting

## API documentation

This module primarily made to be used in other modules.

### new configme(namespace, [searchPath]);

When requireing the configme module, a object constructor is returned.

* The required `namespace` argument is a string unique to your module,
  this will often be your module name. It is used when reading `config.json` files.
* The optional `searchPath` argument, is a string containg an `diretory path`,
  this will be first folder to search for `config.json` file.
  By default this is the location of the configme module folder.

```javascript
var configme = require('configme');
var path = require('path');

var config = new configme('mymodule', path.dirname(module.filename));
```

### Event: error

This module do not throw any errors but emits an `error` when.
But if you do not listen to such event then `Node.js` will throw the error. <br>
_Should the module throw an error then please report this._

```javascript
config.on('error', function (err) {
  console.error(err.trace);
});
```

### Event: done

When a configuration object is created, the `done` event will fire. The event will only fire once.

```javascript
config.on('done', function (info) {
  console.dir(info);
});
```

### configme.search()

The module will first begin searching for a `config.json` file when this function is executed.

```javascript
config.search();
```

### configme.manual(info)

Sometimes you don't want to search for a `config.json` file. In that case the `manual` method,
takes a filepath to a `JSON` file or a configuration object.

When using manual the `namespace` will be ignored.

```javascript
config.manual('~/Sites/config.json');
config.manual({
  awesome: true
});
```

### configme.configPath

This property contain the path to the configuration file if one was found or given.

However it return other values in some cases:

* Before the `configme.search` or `configme.manual` is used this propery is `undefined`.
* If no valid file was given or found after calling `configme.search` or `configme.manual` the value is `null`.

### configme.parser(info, defaults)

This is a manual parser function and should not be used insted of `configme.manual` but in
`default function` as a subparser. See example under default functions.

### configme.defaults

This property is `undefined` by default, meaning that will the `done` event will just return
the given data.

To use default values in you configuration object you should set this equal something.

```javascript
config.defaults = something;
```

#### Objects

When settings `defaults` equal to an object, each property in the `defaults` object will be checks
against the `input` object. A property value may also be another object, in that case its
property will also be parsed and so it continues.

If a property exist in `input` but not in `defaults` it will just be keep as is.

```javascript
config.defaults = {
  http: { port: 80, host: 'localhost' },
  useSSL: false
};

config.manual({
  https: { port: 443, host: 'localhost' }
  useSSL: true
});

config.on('data', function (info) {
  assert.deepEqual(info, {
    http: { post: 80, host: 'localhost' },
    https: { port: 443, host: 'localhost' }
    useSSL: true
  });
});
```

#### Functions

So sometimes you want more control then you can use functions. `.defaults` can be a function
and a property can contain a function.

A function is executed with the `input` source as its only argument, however the `this` keyword
refer to  the object that the function exist in. The value that the function return will overwrite
the `input` value. Note that `source` and `this` are not parsed in any way but contain the original
values.

```javascript
config.defaults = {
  http: { port: 80, host: 'localhost' },
  https: function (source) {
    if (this.useSSL === true && this.https !== false) {
     return configme.parser(this.https, { port: 443, host: 'localhost' });
    }
    return false;
  },
  useSSL: false
};

config.manual({
  https: {port: 400},
  useSSL: true
});

config.on('data', function (info) {
  assert.deepEqual(info, {
    http: { post: 80, host: 'localhost' },
    https: { port: 400, host: 'localhost' }
    useSSL: true
  });
});
```

Also if the function do not have any parent `this` will be `undefined`. However in non-strict mode
`undefined` is not supported and `this` will be `global`.

```javascript
config.defaults = {
  protocols: {
    http: function (source) {
	  "use strict";
	  //use this === global if "use strict" is not used.
	  if (this === undefined) {
	    return { port: 80, host: 'localhost' };
	  }
	  return configme.parser(this.http, { port: 80, host: 'localhost' });
	}
  }
};

//Note that protocols is not defined so the function do not have any parrents
config.manual({});

config.on('data', function (info) {
  assert.deepEqual(info, {
  	protocols: {
      http: { post: 80, host: 'localhost' }
  	}
  });
});
```

#### Arrays

Arrays a very like objects they are parsed by each item. However if the `input` was not an array
it will be converted intro that, where the first item is the `input`. Also if no value was given
as `input` the outcome will be an empty array.

```javascript
config.defaults = {
  http: [{ port: 80, host: 'localhost' }],
  https: [{ port: 443, host: 'localhost' }]
};

//we won't use https
config.manual({
  http: [{ port: 80}, { port: 8000}]
});

config.on('data', function (info) {
  assert.deepEqual(info, {
    http: [
      { post: 80, host: 'localhost' },
      { post: 8000, host: 'localhost' }
    ],
    https: []
  });
});
```

#### Primitives

As you may have guess primitives will only overwrite the `input` value if non is set.

```javascript
config.defaults = {
  http: false,
  https: false
};

//we won't use https
config.manual({
  http: true
});

config.on('data', function (info) {
  assert.deepEqual(info, {
    http: true,
    https: false
  });
});
```

##License

**The software is license under "MIT"**

> Copyright (c) 2012 Andreas Madsen
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

