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


var manualPath = path.join(common.fixtureDir, '/manual.json');
var goal = JSON.parse(fs.readFileSync(manualPath)).test;

// Create a Test Suite
vows.describe('manual configuration input').addBatch({
    'when using a file path': {
        topic: function () {
			var config = new configme('test');
			config.manual(manualPath);
			return common.eventPipe(config);
        },

		'we will read file and return object': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info, goal);
        },

        'configPath will point to the given file': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.object.configPath, manualPath);
        }
    },
	'when useing an object': {
        topic: function () {
			var config = new configme('test');
			config.manual(goal);
			return common.eventPipe(config);
		},

		'we will parse and return': function (err, result) {
			common.isError(err, result);
			assert.deepEqual(result.info, goal);
		},

        'configPath will point to the given file': function (err, result) {
			common.isError(err, result);
			assert.isNull(result.object.configPath);
        }

	}
}).exportTo(module);