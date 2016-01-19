var settingService = module.exports = {};

var Setting = require('./setting').model;
var baseService = require('../baseService');

baseService.addStandardServiceMethods(settingService, Setting);