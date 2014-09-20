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
    if (rankingSystemRef != null){
        if (/^[0-9a-fA-F]{24}$/.test(rankingSystemRef)){
            var pipeline =[
            {$match: { 'rankingSystemRef': rankingSystemRef }},
            {$group: { '_id' : "$placing.greyhoundRef", 'totalPoints' : { '$sum' : "$points" }}},
            {$sort: {"totalPoints": -1}}
            ];
            helper.responseFromPromise(res,  helper.aggregatePromise(PointAllotment, pipeline));
        } else {
            return res.jsonp(400, {"error": "rankingSystemRef must be a valid object id"});
        }
    } else {
        return res.jsonp(400, {"error": "require parameter rankingSystemRef"});
    }
};
