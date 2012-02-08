/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common'),
	configme = require(common.configmePath),
	path = require('path'),
	fs = require('fs'),
	vows = require('vows'),
    assert = require('assert');

var goal = JSON.parse(fs.readFileSync(path.join(common.fixtureDir, '/config.json'))).test;

// Create a Test Suite
vows.describe('search configuration file').addBatch({
	'when non configuration file exist': {
        topic: function () {
			var config = new configme('test', common.root);
			config.search();
			return common.eventPipe(config);
        },

		'we will parse an empty object': function (err, result) {
			common.isError(err, result);
			assert.equal(result.info, undefined);
		},

		'configPath will be false': function (err, result) {
			common.isError(err, result);
			assert.isFalse(result.object.configPath);
		}
	},

    'when only one configuration file exist': {
        topic: function () {
			var config = new configme('test', path.join(common.fixtureDir, '/layer/'));
			config.search();
			return common.eventPipe(config);
        },

		'we will send is config object': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info, goal);
        },

        'configPath will be the path to the file': function (err, result) {
			common.isError(err, result);
			assert.equal(result.object.configPath, path.join(common.fixtureDir, 'config.json'));
        }
    },

	'when the first configuration file isn\'t corrent': {
        topic: function () {
			var config = new configme('test', path.join(common.fixtureDir, '/layer/layer/layer/'));
			config.search();
			return common.eventPipe(config);
		},

		'we will skip it': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info, goal);
		},

		'configPath will point to the correct file': function (err, result) {
			common.isError(err, result);
			assert.equal(result.object.configPath, path.join(common.fixtureDir, 'config.json'));
		}
	},

	'when a search path isn\'t given': {
		topic: function () {
			var config = new configme('test');
			return config;
		},

		'it should default': function (config) {
			assert.equal(config.path, path.dirname(common.configmePath));
		}
	},

	'when a search path hasn\'t been given yet': {
		topic: function () {
			var config = new configme('test');
			return config;
		},

		'configPath will be undefined': function (config) {
			assert.isUndefined(config.configPath);
		}
	}

}).exportTo(module);