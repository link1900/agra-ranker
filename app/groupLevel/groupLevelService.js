var groupLevelService = module.exports = {};

var mongoService = require('../mongoService');
var baseService = require('../baseService');
var eventService = require('../event/eventService');
var GroupLevel = require('./groupLevel').model;

baseService.addStandardServiceMethods(groupLevelService, GroupLevel);