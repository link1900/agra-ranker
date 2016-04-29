var fastTrackMeetingService = module.exports = {};

var fastTrackMeetingModel = require('./fastTrackMeetingModel').model;
var baseService = require('../baseService');

baseService.addStandardServiceMethods(fastTrackMeetingService, fastTrackMeetingModel);
