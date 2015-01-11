var rankingSystemService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var moment = require('moment');
var Placing = require('../placing/placing').model;
var Race = require('../race/race').model;
var Greyhound = require('../greyhound/greyhound').model;
var greyhoundService = require('../greyhound/greyhoundService');
var helper = require('../helper');
var mongoService = require('../mongoService');
var RankingSystem = require('./rankingSystem').model;

rankingSystemService.preProcessRaw = function(entityRequest){
    var model = entityRequest.rawEntity;

    if (!model){
        return q.reject("must have a body");
    }

    entityRequest.newEntity = model;
    return q(entityRequest);
};

rankingSystemService.validateAllotment = function(allotment){
    if (allotment.points == null){
        return q.reject("a point allotment must have points");
    }

    if (!_.isNumber(allotment.points)){
        return q.reject("point allotment points must be a number");
    }
    if (allotment.criteria.length > 0){
        var validations = _.map(allotment.criteria, function(criteria){
            return rankingSystemService.validateAllotmentCriteria(criteria);
        });
        return q.all(validations);
    } else {
        return q(allotment);
    }
};

rankingSystemService.validateAllotmentCriteria = function(criteria){
    if (criteria.field == null || criteria.field.length < 1 || !_.isString(criteria.field)){
        return q.reject("criteria must have a valid field");
    }

    if (criteria.comparator == null){
        return q.reject("criteria must have a comparator");
    }

    if (criteria.comparator != null){
        var validSet = ["=",">","<",">=","<="];
        if (!_.contains(validSet,criteria.comparator)){
            return q.reject("comparator must be one of the following: " + validSet.join(","));
        }
    }

    if (criteria.value == null || criteria.value.length < 1){
        return q.reject("criteria must have a valid value");
    }

    return q(true);
};

rankingSystemService.checkAllotmentIsValid = function(model){
    if (model.pointAllotments != null){
        if (!_.isArray(model.pointAllotments)){
            return q.reject("pointAllotments must be an array");
        } else {
            if (model.pointAllotments.length > 0){
                var validations = _.map(model.pointAllotments, function(allotment){
                    return rankingSystemService.validateAllotment(allotment);
                });
                return q.all(validations);
            } else {
                return q(model);
            }
        }
    } else {
        return q(model);
    }
};

rankingSystemService.validate = function(entityRequest){
    var model = entityRequest.newEntity;
    if (!model.name){
        return q.reject("name field is required");
    }

    if (model.name.length == 0){
        return q.reject("name cannot be blank");
    }

    if (model.description != null && model.description.length > 1000){
        return q.reject("description field is too long");
    }

    if (model.equalPositionResolution != null){
        var validResolutions = ["splitPoints","samePoints"];
        if (!_.contains(validResolutions,model.equalPositionResolution)){
            return q.reject("equalPositionResolution must be one of the following: " + validResolutions.join(","));
        }
    }

    return rankingSystemService.checkAllotmentIsValid(model).then(function(){
        return rankingSystemService.checkNameDoesNotExist(model).then(function(){
            return q(entityRequest);
        });
    });
};

rankingSystemService.checkNameDoesNotExist = function(model){
    return mongoService.find(RankingSystem, {name: model.name}).then(function(results){
        if (results.length == 0){
            return q(true);
        } else if (results.length == 1 && _.isEqual(results[0]._id,model._id)) {
            return q(true);
        } else {
            return q.reject("cannot have the same name as an existing ranking system");
        }
    });
};
