const eventController = module.exports = {};

const eventService = require('./eventService');
const expressService = require('../expressService');

expressService.addStandardMethods(eventController, eventService);

eventController.find = function (req, res) {
    expressService.standardSearch(req, res, eventService, ['type=type', 'type~like']);
};
