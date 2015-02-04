var rankingController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var Ranking = require('./ranking').model;
var helper = require('../helper');
var mongoService = require('../mongoService');
var rankingService = require('./rankingService');

rankingController.setModel = function(req, res, next, id) {
    Ranking.findById(id, function(err, ranking) {
        if (err) return next(err);
        if (!ranking) return next(new Error('Failed to load ranking ' + id));
        req.model = ranking;
        return next();
    });
};

rankingController.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var rankingSystemRef = req.param('rankingSystemRef');
    if (rankingSystemRef){
        req.searchQuery = {'rankingSystemRef': rankingSystemRef};
    }
    req.dao = Ranking;
    next();
};

rankingController.createRankings = function(req, res) {
    var rankingSystemRef = req.param('rankingSystemRef');
    helper.responseFromPromise(res, rankingService.createRankingCalculateBatchJob(rankingSystemRef));
};

rankingController.getRankingsFromCalculation = function(req, res) {
    var rankingSystemRef = req.param('rankingSystemRef');
    var limit = 30;
    if (req.param('per_page') && req.param('per_page') > 0){
        limit = req.param('per_page');
    }

    if (limit > 100) limit = 100;

    var offset = 0;
    if (req.param('page') && req.param('page') > 0){
        offset = req.param('page')-1;
    }

    rankingService.calculateRankings(rankingSystemRef).then(function(rankingResults){
        res.set('total', rankingResults.length);
        res.jsonp(200, rankingResults.slice(limit*offset, limit));
    },function(error){
        helper.errorResponse(res, error);
    });
};