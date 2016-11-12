var rankingController = module.exports = {};

var moment = require('moment-timezone');
var highland = require('highland');

var helper = require('../helper');
var rankingService = require('./rankingService');
var expressService = require('../expressService');

expressService.addStandardMethods(rankingController, rankingService);

rankingController.getDefaultParams = function(req){
    var params = {};
    params.rankingSystemRef = req.param('rankingSystemRef');
    params.periodStart = req.param('startDate');
    params.periodEnd = req.param('endDate');

    if (params.periodStart != null){
        params.periodStart = moment(params.periodStart).toDate();
    } else {
        params.periodStart = moment().toDate();
    }

    if (params.periodEnd != null){
        params.periodEnd = moment(params.periodEnd).toDate();
    } else {
        params.periodStart = moment().subtract(100, 'years').toDate();
    }

    return params;
};

rankingController.getRankings = function(req, res) {
    var params = rankingController.getDefaultParams(req);

    rankingService.createRankingsIfRequired(params.periodStart, params.periodEnd, params.rankingSystemRef).then(function(rankingsFingerPrint){
        var query = {"fingerPrint": rankingsFingerPrint};
        var searchParams = expressService.parseSearchParams(req);
        return expressService.setTotalHeader(res, rankingService, query).then(function(){
            return expressService.promToRes(rankingService.find(query, searchParams.limit, searchParams.offset, searchParams.sort), res);
        });
    },function(error){
        helper.errorResponse(res, error);
    });
};

rankingController.exportCSV = function(req, res){
    var params = rankingController.getDefaultParams(req);

    rankingService.createRankingsIfRequired(params.periodStart, params.periodEnd, params.rankingSystemRef).then(function(rankingsFingerPrint){
        var findOptions = expressService.parseSearchParams(req);
        findOptions.query = {"fingerPrint": rankingsFingerPrint};
        expressService.streamCollectionToCSVResponse(res, findOptions, rankingService, "rankings", rankingService.transformCSV);
    },function(error){
        helper.errorResponse(res, error);
    });
};

rankingController.exportCSVGrid = function(req, res){
    var params = rankingController.getDefaultParams(req);

    rankingService.createRankingsIfRequired(params.periodStart, params.periodEnd, params.rankingSystemRef).then(function(rankingsFingerPrint){
        var query = {"fingerPrint": rankingsFingerPrint};
        var searchParams = expressService.parseSearchParams(req);
        return expressService.setTotalHeader(res, rankingService, query).then(function(){
            rankingService.find(query, searchParams.limit, searchParams.offset, searchParams.sort).then(function(results){
                expressService.streamToCSVResponse(res, "rankingsGrid", highland(rankingService.toCSVGrid(results)));
            },function(error){
                helper.errorResponse(res, error);
            });
        },function(error){
            helper.errorResponse(res, error);
        });
    },function(error){
        helper.errorResponse(res, error);
    });
};
