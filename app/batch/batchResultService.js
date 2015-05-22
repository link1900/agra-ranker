var batchResultService = module.exports = {};

var baseService = require('../baseService');
var BatchResult = require('./batchResult').model;

baseService.addStandardServiceMethods(batchResultService, BatchResult);