var settingController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');

var settingService = require('./settingService');
var mongoService = require('../mongoService');
var expressService = require('../expressService');

expressService.addStandardMethods(settingController, settingService);
