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

		'we will parse an empty object': function (err, info) {
			common.isError(err, info);
			assert.equal(info, undefined);
		}
	},
	
    'when only one configuration file exist': {
        topic: function () {
			var config = new configme('test', path.join(common.fixtureDir, '/layer/'));
			config.search();
			return common.eventPipe(config);
        },

		'we will send is config object': function (err, info) {
			common.isError(err, info);
			assert.deepEqual(info, goal);
        }
    },
    
	'when the first configuration file isn\'t corrent': {
        topic: function () {
			var config = new configme('test', path.join(common.fixtureDir, '/layer/layer/layer/'));
			config.search();
			return common.eventPipe(config);
		},
        
		'we will skip it': function (err, info) {
			common.isError(err, info);
			assert.deepEqual(info, goal);
		}

	},
	
	'when a search path isn\'t given': {
		topic: function() {
			var config = new configme('test');
			return config.path;
		}, 

		'it should default': function (topic) {
			assert.equal(topic, path.dirname(common.configmePath));
		}
	}
}).exportTo(module);