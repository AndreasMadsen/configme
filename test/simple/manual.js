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
		}

	}
}).exportTo(module);