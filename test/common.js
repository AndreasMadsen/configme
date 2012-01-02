/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */
 
//Directorys
var path = require('path');
exports.testDir = path.dirname(module.filename);
exports.root = path.join(exports.testDir, '/../');
exports.configmePath = path.join(exports.root, 'module.js');
exports.fixtureDir = path.join(exports.testDir, '/fixture/');

//pipe events and make a timeout
var EventEmitter = require('events').EventEmitter;
exports.eventPipe = function (config) {
	var e = new EventEmitter();
	
	var timeout = setTimeout(function () {
		e.emit('error', new Error("timeout: error/success was not emitted"));
	}, 500); 
	
	config.on('error', function (err) {
		clearTimeout(timeout);
		e.emit('error', err);
	});
	config.on('done', function (info) {
		clearTimeout(timeout);
		e.emit('success', info);
	});
	
	return e;
};

//copy object
exports.copy = function (obj) {
	return JSON.parse(JSON.stringify(obj));
};

//is error
var assert = require('assert');

exports.isError = function (err, info) {
	
	//test err argument
	assert.ifError(err);
	
	//test info argument
	if (info instanceof Error) {
		throw info;
	}
};