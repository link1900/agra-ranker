const settingController = module.exports = {};

const settingService = require('./settingService');
const expressService = require('../expressService');

expressService.addStandardMethods(settingController, settingService);

settingController.searchFields = ['settingType=settingType'];

settingController.find = function (req, res) {
    expressService.standardSearch(req, res, settingService, settingController.searchFields);
};
