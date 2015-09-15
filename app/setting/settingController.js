var settingController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');

var settingService = require('./settingService');
var mongoService = require('../mongoService');
var expressService = require('../expressService');

expressService.addStandardMethods(settingController, settingService);

settingController.searchFields = ['settingType=settingType'];

settingController.find = function(req, res){
    expressService.standardSearch(req, res, settingService, settingController.searchFields);
};