const settingService = module.exports = {};

const Setting = require('./setting').model;
const baseService = require('../baseService');

baseService.addStandardServiceMethods(settingService, Setting);
