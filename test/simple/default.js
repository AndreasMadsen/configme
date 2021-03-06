/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common'),
	configme = require(common.configmePath),
	vows = require('vows'),
    assert = require('assert');

//Object containg primitives
var primitives = {
	"string"	: "string",
	"boolean"	: true,
	"number"	: 1,
	"null"		: null
};

//function returning a parse function
var hallo = function (scope) {
	return function (source) {
		"use strict";
		if (scope) {
			return {
				scopes: [source, this],
				value: 'result'
			};
		}
		return null;
	};
};

// Create a Test Suite
vows.describe('defaulting configuration').addBatch({
	'when non defaults object is provied': {
        topic: function () {
			var config = new configme('test');
			config.manual(common.copy(primitives));
			return common.eventPipe(config);
        },

        'we will just use it as is': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info, primitives);
        }
	},

	'when no input is provied': {
		topic: function () {
			var config = new configme('test');
			config.defaults = {
				'values': common.copy(primitives),
				'value': hallo()
			};
			config.manual(undefined);
			return common.eventPipe(config);
		},

		'we will parse on an empty object': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info.values, primitives);
		},

		'we will remember to use default fuctions': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info, {
				"values": primitives,
				"value" : null
			});
		}
	},

	'when both input and defaults exist': {
		topic: function () {
			var config = new configme('test');
			config.defaults = {
				'value': false
			};
			config.manual({
				'value': true
			});
			return common.eventPipe(config);
		},

		'we will use input': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info, {
				'value': true
			});
		}
	},

    'when using primitives in defaults': {
        topic: function () {
			var config = new configme('test');
			config.defaults = common.copy(primitives);
			config.manual({});
			return common.eventPipe(config);
        },

		'we won\'t deep parse': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info, primitives);
        }
    },

	'when using Arrays in defaults': {
		topic: function () {
			var config = new configme('test');
			config.defaults = {
				'value' : [common.copy(primitives)],
				'items' : [common.copy(primitives)],
				'miss' : [common.copy(primitives)]
			};
			config.manual({
				"value" : {},
				"items"	: [{}, primitives]
			});
			return common.eventPipe(config);
		},

		'we will convert non-arrays to array and parse': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info.value, [primitives]);
        },

		'we will parse each item and return': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info.items, [primitives, primitives]);
        },

		'we will convert missing element to empty arrays': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info.miss, []);
        }
	},

	"when using Objects in defaults": {
		topic: function () {
			var config = new configme('test');
			config.defaults = {
				"values": common.copy(primitives),
				"deep" : {
					"first" : common.copy(primitives),
					"second": common.copy(primitives)
				},
				"value" : common.copy(primitives)
			};
			config.manual({
				"values": {},
				"deep": {
					"first": false
				},
				"value" : false
			});
			return common.eventPipe(config);
		},

		'we skip primtive input values': function (err, result) {
			common.isError(err, result);
			assert.equal(result.info.value, false);
		},

		'we parse object by each property': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info.values, primitives);
		},

		'we will deep parse object by object': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info, {
				values: primitives,
				deep: {
					first : false,
					second: primitives
				},
				value: false
			});
		}
	},

	"when using Functions in defaults": {
		topic: function () {
			var config = new configme('test');
			config.defaults = {
				"values" : hallo('scope'),
				"layer": {
					"layer": {
						"layer" : {
							"value": hallo('scope')
						}
					}
				}
			};
			config.manual({
				"values" : "function test"
			});
			return common.eventPipe(config);
		},

		'we will replace with return content': function (err, result) {
			common.isError(err, result);
			assert.equal(result.info.values.value, 'result');
		},


		'we will send source as argument and scope as this': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info.values.scopes[0], result.info.values.scopes[1]);
		},

		'we will have this to be undefined, when parent input is given': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info.layer, {
				layer : {
					layer : {
						value: {
							scopes: [
								{values: 'function test'},
								undefined
							],
							value: 'result'
						}
					}
				}
			});
		}
	},

	'when using the parser function': {
		topic: function () {
			var defaults = {
				'value' : [common.copy(primitives)],
				'items' : [common.copy(primitives)],
				'miss' : [common.copy(primitives)]
			};
			var value = {
				"value" : {},
				"items"	: [{}, primitives]
			};
			return configme.parser(value, defaults);
		},

		'it will return a parsed object': function (info) {
			if (info instanceof Error) {
				throw info;
			}
			assert.deepEqual(info.value, [primitives]);
			assert.deepEqual(info.items, [primitives, primitives]);
			assert.deepEqual(info.miss, []);
		}
	}

}).exportTo(module);