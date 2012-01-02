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

var config = new confme('mymodule', path.dirname(module.filename));
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

### configme.defaults

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

