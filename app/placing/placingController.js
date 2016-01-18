var placingController = module.exports = {};

var placingService = require('./placingService');
var expressService = require('../expressService');

expressService.addStandardMethods(placingController, placingService);

placingController.find = function(req, res){
    expressService.standardSearch(req, res, placingService, ['greyhoundRef=greyhoundRef', 'raceRef=raceRef']);
};

placingController.create = function(req, res) {
    expressService.promToRes(placingService.createPlacing(req.body), res);
};

placingController.update = function(req, res) {
    expressService.promToRes(placingService.updatePlacing(req.model, req.body), res);
};

placingController.destroy = function(req, res) {
    expressService.promToRes(placingService.remove(req.model), res);
};