'use strict';

var rankingController = module.exports = {};

var mongoose = require('mongoose');
var PointAllotment = mongoose.model('PointAllotment');
var Placing = mongoose.model('Placing');
var _ = require('lodash');
var helper = require('../helper');
var q = require('q');


rankingController.getRankings = function(req, res) {
    var rankingSystemRef = req.param('rankingSystemRef');
    var fromDate = req.param('fromDate');
    var toDate = req.param('toDate');
    var limit = req.param('limit');
    var matchQuery = {};
    if (fromDate != null){
        helper.addField(matchQuery,'placing.race.date',{"$gte" : fromDate});
    }
    if (toDate != null){
        helper.addField(matchQuery,'placing.race.date',{"$lte" : toDate});
    }
    if (limit == null){
        limit = 100;
    }
    if (rankingSystemRef != null){
        matchQuery['rankingSystemRef']=rankingSystemRef;
        if (/^[0-9a-fA-F]{24}$/.test(rankingSystemRef)){
            var pipeline =[
            {$match: matchQuery},
            {$group: { '_id' : "$placing.greyhoundRef", 'totalPoints' : { '$sum' : "$points" }}},
            {$sort: {"totalPoints": -1}},
            {$limit: limit}
            ];
            helper.responseFromPromise(res,  helper.aggregatePromise(PointAllotment, pipeline));
        } else {
            return res.jsonp(400, {"error": "rankingSystemRef must be a valid object id"});
        }
    } else {
        return res.jsonp(400, {"error": "require parameter rankingSystemRef"});
    }
};
