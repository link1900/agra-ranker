var eventController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var Event = require('./event').model;
var eventService = require('./eventService');
var helper = require('../helper');
var mongoService = require('../mongoService');
var expressService = require('../expressService');

expressService.addStandardMethods(eventController, eventService);

eventController.find = function(req, res){
    var query = expressService.buildQuery(req, ['type']);
    var searchParams = expressService.parseSearchParams(req);

    return expressService.setTotalHeader(res, eventService).then(function(){
        return expressService.promToRes(eventService.find(query, searchParams.limit, searchParams.offset, searchParams.sort),res);
    });
};