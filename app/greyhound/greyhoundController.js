var greyhoundController = module.exports = {};

var mongoose = require('mongoose');
var q = require('q');
var _ = require('lodash');
var Greyhound = require('./greyhound').model;
var helper = require('../helper');
var expressService = require('../expressService');
var greyhoundService = require('./greyhoundService');
var eventService = require('../event/eventService');


expressService.addStandardMethods(greyhoundController, greyhoundService);

greyhoundController.find = function(req, res){
    var query = expressService.buildQueryFromRequest(req, ['name=name','name~like','sireRef=parentRef||damRef=parentRef']);
    var searchParams = expressService.parseSearchParams(req);

    return expressService.setTotalHeader(res, greyhoundService).then(function(){
        return helper.responseFromPromise(res, greyhoundService.find(query, searchParams.limit, searchParams.offset, searchParams.sort));
    });
};

greyhoundController.create = function(req, res) {
    expressService.promToRes(greyhoundService.createGreyhoundFromJson(req.body), res);
};

greyhoundController.update = function(req, res) {
    expressService.promToRes(greyhoundService.updateGreyhoundFromJson(req.model, req.body), res);
};