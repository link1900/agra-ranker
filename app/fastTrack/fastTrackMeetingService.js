const fastTrackMeetingService = module.exports = {};

const fastTrackMeetingModel = require('./fastTrackMeetingModel').model;
const baseService = require('../baseService');

baseService.addStandardServiceMethods(fastTrackMeetingService, fastTrackMeetingModel);
