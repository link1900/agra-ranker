var rankingSystemService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var moment = require('moment');
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

    if (criteria.type == null){
        return q.reject("criteria must have a type");
    }

    if (criteria.type != null){
        var validTypeSet = ["Text","Number","Date","Boolean","Preset"];
        if (!_.contains(validTypeSet,criteria.type)){
            return q.reject("criteria type must be one of the following: " + validTypeSet.join(","));
        }

        if (criteria.type == "Text"){
            if (!_.isString(criteria.value)) {
                return q.reject("if criteria type is text the value must be a text");
            }
        }

        if (criteria.type == "Number"){
            if (!_.isNumber(criteria.value)) {
                return q.reject("if criteria type is number the value must be a number");
            }
        }

        if (criteria.type == "Date"){
            if (!_.isDate(criteria.value)) {
                return q.reject("if criteria type is date the value must be a date");
            }
        }

        if (criteria.type == "Boolean"){
            if (!_.isBoolean(criteria.value)) {
                return q.reject("if criteria type is boolean the value must be a boolean");
            }
        }
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

rankingSystemService.getQueryForPointAllotment = function(pointAllotment){
    var query = {};
    pointAllotment.criteria.forEach(function(criteria){
        //replace placeholders
        if (criteria.value != null && _.isString(criteria.value) &&  criteria.value.indexOf('##') == 0){
            criteria.value = rankingSystemService.convertPlaceHolder(criteria.value);
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

rankingSystemService.convertPlaceHolder = function(placeholder){
    if (_.contains(_.keys(rankingSystemService.presetCriteriaFields), placeholder)){
        return rankingSystemService.presetCriteriaFields[placeholder].value;
    } else {
        return placeholder;
    }
};

rankingSystemService.getFinancialYearForDate = function(now){
    var midYear = moment(now).set('month', 7).set('date', 1).startOf('day');
    if (midYear.isAfter(now)){
        return { start: midYear.clone().subtract(12, 'months').toDate(), end : midYear.subtract(1, 'days').endOf('day').toDate()};
    } else {
        return { start: midYear.toDate(), end : midYear.clone().add(12, 'months').subtract(1, 'days').endOf('day').toDate()};
    }
};

rankingSystemService.getYearForDate = function(now){
    var startYear = moment(now).set('month', 1).set('date', 1).startOf('day');
    var endYear = moment(now).set('month', 12).set('date', 31).endOf('day');
    return {start: startYear, end: endYear};
};

rankingSystemService.presetCriteriaFields = {
    "currentFinancialYearStart":{
        label:"Current Financial Year Start",
        value: rankingSystemService.getFinancialYearForDate(new Date()).start
    },
    "currentFinancialYearEnd":{
        label:"Current Financial Year End",
        value: rankingSystemService.getFinancialYearForDate(new Date()).end
    },
    "currentCalendarYearStart":{
        label:"Current Calendar Year Start",
        value: rankingSystemService.getYearForDate(new Date()).start
    },
    "currentCalendarYearEnd":{
        label:"Current Calendar Year End",
        value: rankingSystemService.getYearForDate(new Date()).end
    }
};
