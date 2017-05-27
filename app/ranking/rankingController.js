const rankingController = module.exports = {};

const moment = require('moment');
const highland = require('highland');

const helper = require('../helper');
const rankingService = require('./rankingService');
const expressService = require('../expressService');

expressService.addStandardMethods(rankingController, rankingService);

rankingController.getDefaultParams = function (req) {
    const params = {};
    params.rankingSystemRef = req.param('rankingSystemRef');
    params.periodStart = req.param('startDate');
    params.periodEnd = req.param('endDate');

    if (params.periodStart != null) {
        params.periodStart = moment(params.periodStart).toDate();
    } else {
        params.periodStart = moment().toDate();
    }

    if (params.periodEnd != null) {
        params.periodEnd = moment(params.periodEnd).toDate();
    } else {
        params.periodStart = moment().subtract(100, 'years').toDate();
    }

    return params;
};

rankingController.getRankings = function (req, res) {
    const params = rankingController.getDefaultParams(req);

    rankingService.createRankingsIfRequired(params.periodStart, params.periodEnd, params.rankingSystemRef).then((rankingsFingerPrint) => {
        const query = { fingerPrint: rankingsFingerPrint };
        const searchParams = expressService.parseSearchParams(req);
        return expressService.setTotalHeader(res, rankingService, query).then(() => {
            return expressService.promToRes(rankingService.find(query, searchParams.limit, searchParams.offset, searchParams.sort), res);
        });
    }, (error) => {
        helper.errorResponse(res, error);
    });
};

rankingController.exportCSV = function (req, res) {
    const params = rankingController.getDefaultParams(req);

    rankingService.createRankingsIfRequired(params.periodStart, params.periodEnd, params.rankingSystemRef).then((rankingsFingerPrint) => {
        const findOptions = expressService.parseSearchParams(req);
        findOptions.query = { fingerPrint: rankingsFingerPrint };
        expressService.streamCollectionToCSVResponse(res, findOptions, rankingService, 'rankings', rankingService.transformCSV);
    }, (error) => {
        helper.errorResponse(res, error);
    });
};

rankingController.exportCSVGrid = function (req, res) {
    const params = rankingController.getDefaultParams(req);

    rankingService.createRankingsIfRequired(params.periodStart, params.periodEnd, params.rankingSystemRef).then((rankingsFingerPrint) => {
        const query = { fingerPrint: rankingsFingerPrint };
        const searchParams = expressService.parseSearchParams(req);
        return expressService.setTotalHeader(res, rankingService, query).then(() => {
            rankingService.find(query, searchParams.limit, searchParams.offset, searchParams.sort).then((results) => {
                expressService.streamToCSVResponse(res, 'rankingsGrid', highland(rankingService.toCSVGrid(results)));
            }, (error) => {
                helper.errorResponse(res, error);
            });
        }, (error) => {
            helper.errorResponse(res, error);
        });
    }, (error) => {
        helper.errorResponse(res, error);
    });
};
