var rankingController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var moment = require('moment');
var mongoose = require('mongoose');
var Ranking = require('./ranking').model;
var helper = require('../helper');
var mongoService = require('../mongoService');
var rankingService = require('./rankingService');
var expressService = require('../expressService');

expressService.addStandardMethods(rankingController, rankingService);

rankingController.getRankings = function(req, res) {
    var rankingSystemRef = req.param('rankingSystemRef');
    var periodStart = req.param('startDate');
    var periodEnd = req.param('endDate');
    var limit = 30;
    if (req.param('per_page') && req.param('per_page') > 0){
        limit = req.param('per_page');
    }

    if (limit > 100) limit = 100;

    var offset = 0;
    if (req.param('page') && req.param('page') > 0){
        offset = req.param('page')-1;
    }

    if (periodStart != null){
        periodStart = moment(periodStart).toDate();
    }

    if (periodEnd != null){
        periodEnd = moment(periodEnd).toDate();
    }

    rankingService.calculateRankings(periodStart, periodEnd, rankingSystemRef).then(function(rankingResults){
        res.set('total', rankingResults.length);
        res.jsonp(200, rankingResults.slice(limit*offset, (limit*offset)+limit));
    },function(error){
        helper.errorResponse(res, error);
    });
};