'use strict';

var pointAllotmentController = module.exports = {};
var mongoose = require('mongoose');
var PointAllotment = mongoose.model('PointAllotment');
var RankingSystem = mongoose.model('RankingSystem');
var Placing = mongoose.model('Placing');
var _ = require('lodash');
var helper = require('../helper');
var q = require('q');


pointAllotmentController.setModel = function(req, res, next, id) {
    PointAllotment.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load ' + id));
        req.model = model;
        return next();
    });
};

pointAllotmentController.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var greyhoundRef = req.param('greyhoundRef');
    if (greyhoundRef){
        if (/^[0-9a-fA-F]{24}$/.test(greyhoundRef)){
            req.searchQuery.greyhoundRef = greyhoundRef;
        } else {
            return res.jsonp(400, {"error": "greyhoundRef must be a valid object id"});
        }
    }
    var rankingSystemRef = req.param('rankingSystemRef');
    if (rankingSystemRef != null){
        if (/^[0-9a-fA-F]{24}$/.test(rankingSystemRef)){
            req.searchQuery.rankingSystemRef = rankingSystemRef;
        } else {
            return res.jsonp(400, {"error": "rankingSystemRef must be a valid object id"});
        }
    }
    req.dao = PointAllotment;
    next();
};

pointAllotmentController.createMany = function(req, res) {
    var rankingSystemRef = req.param('rankingSystemRef');
    if (rankingSystemRef != null){
        if (/^[0-9a-fA-F]{24}$/.test(rankingSystemRef)){
            helper.responseFromPromise(res,pointAllotmentController.createManyPointAllotments(rankingSystemRef));
        } else {
            return res.jsonp(400, {"error": "rankingSystemRef must be a valid object id"});
        }
    } else {
        return res.jsonp(400, {"error": "require parameter rankingSystemRef"});
    }
};

pointAllotmentController.createManyPointAllotments = function(rankingSystemRef){
    return helper.findOneById(RankingSystem, rankingSystemRef).then(function(rankingSystem){
        return pointAllotmentController.clearPointAllotmentsForRankingSystem(rankingSystem).then(function(){
            return pointAllotmentController.allocatePointAllotments(rankingSystem).then(function(results){
                return results;
            });
        });
    });
};

pointAllotmentController.clearPointAllotmentsForRankingSystem = function(rankingSystem){
    return helper.removeAll(PointAllotment, {rankingSystemRef : rankingSystem._id});
};

pointAllotmentController.allocatePointAllotments = function(rankingSystem){
    var pointAllocations = _.map(rankingSystem.pointAllotments, function(pointAllotment){
        return pointAllotmentController.allocatePointAllotment(rankingSystem, pointAllotment);
    });

    return q.allSettled(pointAllocations).then(function(results){
        console.log(results);
        return results;
    });
};

pointAllotmentController.allocatePointAllotment = function(rankingSystem, pointAllotment){
    //build query from criteria
    var query = {};
    pointAllotment.criteria.forEach(function(criteria){
        switch (criteria.comparator){
            case "=":
                query[criteria.field] = criteria.value;
                break;
            default:
                query[criteria.field] = criteria.value;
                break;
        }
    });

    //run query
    return pointAllotmentController.getPlacingsForAllotment(query).then(function(placings){
        //on each query result insert many pointAllocations
        var createAllotments = placings.map(function(placing){
            var pointAllotmentRaw = {
                points: pointAllotment.points,
                greyhoundRef: placing.greyhoundRef,
                placingRef: placing._id,
                rankingSystemRef: rankingSystem._id
            };
            var pointAllotment = new PointAllotment(pointAllotmentRaw);
            return helper.savePromise(pointAllotment);
        });

        return q.allSettled(createAllotments).then(function(results){
            console.log(results);
            return results;
        });
    });
};

pointAllotmentController.getPlacingsForAllotment = function(query){
    var deferred = q.defer();
    Placing.find(query).exec(function(entities){
        if (err){
            deferred.reject(err);
        } else {
            deferred.resolve(entities);
        }
    });
    return deferred.promise;
};