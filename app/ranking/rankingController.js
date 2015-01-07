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
    var limit = req.param('limit');

    if (rankingSystemRef != null){
        helper.responseFromPromise(res, rankingService.calculateRankings(rankingSystemRef, fromDate, toDate, limit));
    } else {
        return res.jsonp(400, {"error": "require parameter rankingSystemRef"});
    }
};