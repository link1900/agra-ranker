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

    if (periodStart != null){
        periodStart = moment(periodStart).toDate();
    } else {
        periodStart = moment().toDate();
    }

    if (periodEnd != null){
        periodEnd = moment(periodEnd).toDate();
    } else {
        periodStart = moment().subtract(100, 'years').toDate();
    }

    rankingService.createRankingsIfRequired(periodStart, periodEnd, rankingSystemRef).then(function(rankingsFingerPrint){
        var query = {"fingerPrint": rankingsFingerPrint};
        var searchParams = expressService.parseSearchParams(req);
        return expressService.setTotalHeader(res, rankingService, query).then(function(){
            return expressService.promToRes(rankingService.find(query, searchParams.limit, searchParams.offset, searchParams.sort), res);
        });
    },function(error){
        helper.errorResponse(res, error);
    });
};