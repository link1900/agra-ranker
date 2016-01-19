var eventController = module.exports = {};

var eventService = require('./eventService');
var expressService = require('../expressService');

expressService.addStandardMethods(eventController, eventService);

eventController.find = function(req, res){
    expressService.standardSearch(req, res, eventService, ["type=type","type~like"]);
};