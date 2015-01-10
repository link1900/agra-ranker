var rankingController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var PointAllotment = require('./pointAllotment').model;
var Ranking = require('./ranking').model;
var Placing = require('../placing/placing').model;
var helper = require('../helper');
var mongoService = require('../mongoService');
var rankingService = require('./rankingService');

rankingController.getRankings = function(req, res) {
    var rankingSystemRef = req.param('rankingSystemRef');
    var fromDate = req.param('fromDate');
    var toDate = req.param('toDate');
    var limit = 30;
    if (req.param('per_page') && req.param('per_page') > 0){
        limit = req.param('per_page');
    }

    if (limit > 100) limit = 100;

    var offset = 0;
    if (req.param('page') && req.param('page') > 0){
        offset = req.param('page')-1;
    }

    rankingService.calculateRankings(rankingSystemRef, fromDate, toDate).then(function(rankingResults){
        res.set('total', rankingResults.length);
        res.jsonp(200, rankingResults.slice(limit*offset, limit));
    },function(error){
        helper.errorResponse(res, error);
    });
};