'use strict';

var rankingController = module.exports = {};

var mongoose = require('mongoose');
var PointAllotment = mongoose.model('PointAllotment');
var Placing = require('../placing/placing').model;
var Ranking = mongoose.model('Ranking');
var _ = require('lodash');
var helper = require('../helper');
var mongoHelper = require('../mongoHelper');
var Schema = mongoose.Schema;
var q = require('q');

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
    var pipeline =[
        {$group: { '_id': {'rankingSystemRef' : "$rankingSystemRef", 'greyhoundRef' : "$placing.greyhoundRef", 'greyhoundName' : "$placing.greyhound.name"}, 'totalPoints' : { '$sum' : "$points" }}},
        {$project: {'_id': 0 ,'rankingSystemRef': '$_id.rankingSystemRef', 'greyhoundRef' : "$_id.greyhoundRef", 'greyhoundName' : "$_id.greyhoundName"}},
        {$sort: {"totalPoints": -1}},
        {$out: "rankings"}
    ];
    helper.responseFromPromise(res,  mongoHelper.aggregatePromise(PointAllotment, pipeline));
};
//
//rankingController.getRankings = function(req, res) {
//    var rankingSystemRef = req.param('rankingSystemRef');
//    var fromDate = req.param('fromDate');
//    var toDate = req.param('toDate');
//    var limit = req.param('limit');
//    var matchQuery = {};
//    if (fromDate != null){
//        helper.addField(matchQuery,'placing.race.date',{"$gte" : fromDate});
//    }
//    if (toDate != null){
//        helper.addField(matchQuery,'placing.race.date',{"$lte" : toDate});
//    }
//    if (limit == null){
//        limit = 100;
//    }
//    if (rankingSystemRef != null){
//        matchQuery['rankingSystemRef']=rankingSystemRef;
//        if (/^[0-9a-fA-F]{24}$/.test(rankingSystemRef)){
//            var pipeline =[
//            {$match: matchQuery},
//            {$group: { '_id' : "$placing.greyhoundRef", 'totalPoints' : { '$sum' : "$points" }}},
//            {$sort: {"totalPoints": -1}},
//            {$limit: limit}
//            ];
//            helper.responseFromPromise(res,  helper.aggregatePromise(PointAllotment, pipeline));
//        } else {
//            return res.jsonp(400, {"error": "rankingSystemRef must be a valid object id"});
//        }
//    } else {
//        return res.jsonp(400, {"error": "require parameter rankingSystemRef"});
//    }
//};
