var batchResultController = module.exports = {};

var expressService = require('../expressService');
var batchResultService = require('./batchResultService');

expressService.addStandardMethods(batchResultController, batchResultService);

batchResultController.find = function(req, res){
    expressService.standardSearch(req, res, batchResultService, ['batchRef=batchRef']);
};
