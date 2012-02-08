/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

/*jshint strict: true, devel: true, node: true, debug: true,
  white: true, sub: false, newcap: true, curly: true, nomen: true,
  boss: true, eqeqeq: true, noarg: true, onevar: true, undef: true,
  regexp: true, noempty: true, maxerr: 999
 */

(function (undefined) {
	"use strict";

	//Modules required
	var util = require('util'),
		path = require('path'),
		fs = require('fs'),
		EventEmitter = require('events').EventEmitter,

	// exists
		doExists = fs.exists || path.exists;

	//Error handler
	function errorHandler(self, error) {
		if (error) {
			self.emit('error', error);
			return true;
		}
		return false;
	}

    /**
     * Constructor function
     * @use configme = new ConfigMe(String name, [String searchPath]);
     * @inherts EventEmitter
     *
     * @param	name		name of the property in config.json should be the module name
     * @param	searchPath	where to start seaching for config.json
     * @return	new instance of configme
     */
    function ConfigMe(name, searchPath) {

		var self = this;

		//We need a name, emit error if non exist
		if (typeof name !== 'string') {
			process.nextTick(function () {
				errorHandler(self, new TypeError('name argument need to be a string'));
			});

			//default behavoure
			return this;
		}

		//Set values
		this.name = name;
		this.path = searchPath || path.dirname(module.filename);

		//Hide a isProgressing property
		Object.defineProperty(this, 'isProgressing', {
			value: false,
			writable: true
		});

		//default behavoure
		return this;
    }
	util.inherits(ConfigMe, EventEmitter);
	module.exports = function (name, path) {
		return new ConfigMe(name, path);
	};

	/**
     * Contain an object with default values
     * @use configme.defaults = Object defaultValues;
     * @default Undefined
     *
     */
    function getObject(source, deep) {
		var current = source, i, l;

		//In case the source don't go deep enoght
		if  (deep.indexOf(undefined) !== -1) {
			return undefined;
		}

		for (i = 0, l = deep.length - 1; i < l; i++) {
			current = current[deep[i]];
		}
		return current;
	}

	function defaultProperty(object, defaults, source, deep) {
		var type, keys, i, propName;

		//Functions in defaults will take object as an argument and return a parsed object
		if (defaults instanceof Function) {
			object = defaults.call(getObject(source, deep), source);
		}

		//Arrays will be parsed by each item
		else if (defaults instanceof Array) {

			//In case of undefined indicate using empty object
			if (object === undefined) {
				return [];
			}

			//If object isn't an array convert it
			if (!(object instanceof Array)) {
				object = [object];
			}

			i = object.length;
			while (i--) {
				object[i] = defaultProperty(object[i], defaults[0], source, deep.concat([i]));
			}
		}

		//Objects will be parsed by each propery, if defaults support so
		else if (object instanceof Object && defaults instanceof Object) {

			keys = Object.keys(defaults);
			i = keys.length;
			while (i--) {
				propName = keys[i];
				object[propName] = defaultProperty(object[propName], defaults[propName], source, deep.concat([propName]));
			}
		}

		//else it must be a primative, and we only overwrite if it isn't set
		else if (object === undefined) {

			type = typeof defaults;

			//And defaults is a primtive
			if (defaults === null || (type !== 'object' && type !== 'function')) {
				object = defaults;
			}

			//else we will deep parse an empty object
			else {
				object = defaultProperty({}, defaults, source, deep.concat([propName]));
			}
		}

		return object;
	}
    function handleData(self, info) {

		//don't use defaults if not set
		if (self.defaults === undefined) {
			self.emit('done', info);
			return;
		}

		//Copy info
		var source = info === undefined ? undefined : JSON.parse(JSON.stringify(info));

		//Parse defaults on to the info object
		//and emit done
		self.emit('done', defaultProperty(info, self.defaults, source, []));
    }
	ConfigMe.prototype.defaults = undefined;

	/**
     * Start search using provied path property and default missing values
     * @use Undefined = configme.search();
     *
     * @emit	error, done
     * @return	Undefined
     */
    function fileSearch(self, searchPath) {

		//Do file exist
		var fileName = path.join(searchPath, 'config.json'),
			nextSearch = path.dirname(searchPath);
		doExists(fileName, function (exist) {

			//File do not exist
			if (!exist) {

				//If we hit the bottom without result
				if (searchPath === nextSearch) {
					//we will parse an empty object
					handleData(self, undefined);
					return;
				}

				//To down in the folder tree
				fileSearch(self, nextSearch);
				return;
			}

			//Read file
			fs.readFile(fileName, 'utf8', function (err, data) {
				if (errorHandler(self, err)) {
					return;
				}

				//Is JSON data
				try {
					data = JSON.parse(data);
				} catch (exp) {
					errorHandler(self, exp);
					return;
				}

				//Check that name is a property
				if (data[self.name] === undefined) {
					fileSearch(self, nextSearch);
					return;
				}

				//parse the config object emit done
				handleData(self, data[self.name]);
			});
		});
    }

	ConfigMe.prototype.search = function () {
		// Only one configuration function can run
		if (this.isProgressing === true) {
			return;
		}
		this.isProgressing = true;

		fileSearch(this, path.normalize(this.path));
	};

	/**
     * Use a manual input to read configuration objct and then default missing values
     * @use Undefined = configme.manual(String|Object info);
     *
     * @param	info	string: use as JSON filepath; object: use as JSON object
     *
     * @emit	error, done
     * @return	Undefined
     */
	ConfigMe.prototype.manual = function (info) {
		var self = this;

		// Only one configuration function can run
		if (this.isProgressing === true) {
			return;
		}
		this.isProgressing = true;

		//This should be a filepath
		if (typeof info === 'string') {
			doExists(path.normalize(info), function (exist) {
				if (!exist) {
					errorHandler(self, new Error('configuration file ' + info + ' do not exist'));
					return;
				}

				//Read file
				fs.readFile(info, 'utf8', function (err, data) {
					if (errorHandler(self, err)) {
						return;
					}

					//Is JSON data
					var info;
					try {
						info = JSON.parse(data);
					} catch (exp) {
						errorHandler(self, exp);
						return;
					}

					//parse the config object emit done
					handleData(self, info[self.name]);
				});
			});
		}

		//This is a normal JSON object
		else if (info instanceof Object) {
			//parse the config object emit done
			process.nextTick(function () {
				handleData(self, info);
			});
		}

		else if (info === undefined) {
			//parse the config object emit done
			process.nextTick(function () {
				handleData(self, undefined);
			});
		}

		//Else TypeError
		else {
			errorHandler(this, new TypeError('worng type expected Object or String'));
		}
	};

})();
