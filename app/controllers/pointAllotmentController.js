'use strict';

var pointAllotmentController = module.exports = {};
var mongoose = require('mongoose');
var PointAllotment = mongoose.model('PointAllotment');
var RankingSystem = mongoose.model('RankingSystem');
var Placing = mongoose.model('Placing');
var _ = require('lodash');
var helper = require('../helper');
var mongoHelper = require('../mongoHelper');
var q = require('q');
var moment = require('moment');


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
            req.searchQuery['placing.greyhoundRef'] = greyhoundRef;
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
    return mongoHelper.findOneById(RankingSystem, rankingSystemRef).then(function(rankingSystem){
        return pointAllotmentController.clearPointAllotmentsForRankingSystem(rankingSystem).then(function(){
            return pointAllotmentController.allocatePointAllotments(rankingSystem).then(function(results){
                return results;
            });
        });
    });
};

pointAllotmentController.clearPointAllotmentsForRankingSystem = function(rankingSystem){
    return mongoHelper.removeAll(PointAllotment, {rankingSystemRef : rankingSystem._id});
};

pointAllotmentController.allocatePointAllotments = function(rankingSystem){
    var pointAllocations = rankingSystem.pointAllotments.map(function(pointAllotment){
        return pointAllotmentController.allocatePointAllotment(rankingSystem, pointAllotment);
    });
    return q.allSettled(pointAllocations).then(function(results){
        var count = results.filter(function(item){
            return item.state == 'fulfilled';
        }).map(function(item){
            return item.value;
        }).reduce(function(previousValue, currentValue){
            return previousValue + currentValue;
        });
        return {"created": count};
    });
};

pointAllotmentController.allocatePointAllotment = function(rankingSystem, pointAllotment){
    //build query from criteria
    var query = pointAllotmentController.getQueryForPointAllotment(pointAllotment);
    //run query
    return pointAllotmentController.getPlacingsForAllotment(query).then(function(placings){
        //on each query result insert many pointAllocations
        var points = pointAllotment.points;
        var createAllotmentPromises = placings.map(function(placing){
            var pointAllotmentRaw = {
                points: points,
                placingRef: placing._id,
                placing: placing,
                rankingSystemRef: rankingSystem._id
            };
            var pointAllotment = new PointAllotment(pointAllotmentRaw);
            return mongoHelper.savePromise(pointAllotment);
        });
        return q.allSettled(createAllotmentPromises).then(function(results){
            return results.filter(function(item){
                return item.state == 'fulfilled';
            }).length;
        });
    });
};

pointAllotmentController.getPlacingsForAllotment = function(query){
    var deferred = q.defer();
    Placing.find(query).exec(function(err, entities){
        if (err){
            deferred.reject(err);
        } else {
            deferred.resolve(entities);
        }
    });
    return deferred.promise;
};

pointAllotmentController.getQueryForPointAllotment = function(pointAllotment){
    var query = {};
    pointAllotment.criteria.forEach(function(criteria){
        //replace placeholders
        if (criteria.value != null && _.isString(criteria.value) &&  criteria.value.indexOf('##') == 0){
            criteria.value = pointAllotmentController.convertPlaceHolder(criteria.value);
        }
    });

    pointAllotment.criteria.forEach(function(criteria){
        switch (criteria.comparator){
            case "=":
                query[criteria.field] = criteria.value;
                break;
            case ">":
                helper.addField(query, criteria.field, {"$gt": criteria.value});
                break;
            case "<":
                helper.addField(query, criteria.field, {"$lt": criteria.value});
                break;
            case ">=":
                helper.addField(query, criteria.field, {"$gte": criteria.value});
                break;
            case "<=":
                helper.addField(query, criteria.field, {"$lte": criteria.value});
                break;
            case "!=":
                helper.addField(query, criteria.field, {"$ne": criteria.value});
                break;
            default:
                query[criteria.field] = criteria.value;
                break;
        }
    });
    return query;
};

pointAllotmentController.convertPlaceHolder = function(placeholder){
    switch (placeholder){
        case "##currentFinancialYear.start":
            return pointAllotmentController.getFinancialYearForDate(new Date()).start;
            break;
        case "##currentFinancialYear.end":
            return pointAllotmentController.getFinancialYearForDate(new Date()).end;
            break;
        default:
            return placeholder;
            break;
    }
};

pointAllotmentController.getFinancialYearForDate = function(now){
    var midYear = moment(now).set('month', 7).set('date', 1).startOf('day');
    if (midYear.isAfter(now)){
        return { start: midYear.clone().subtract(12, 'months').toDate(), end : midYear.subtract(1, 'days').endOf('day').toDate()};
    } else {
        return { start: midYear.toDate(), end : midYear.clone().add(12, 'months').subtract(1, 'days').endOf('day').toDate()};
    }
};