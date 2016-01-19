var settingController = module.exports = {};

var settingService = require('./settingService');
var expressService = require('../expressService');

expressService.addStandardMethods(settingController, settingService);

settingController.searchFields = ['settingType=settingType'];

settingController.find = function(req, res){
    expressService.standardSearch(req, res, settingService, settingController.searchFields);
};