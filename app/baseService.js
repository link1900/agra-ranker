var baseService = module.exports = {};
var q = require('q');
var _ = require('lodash');
var eventService = require('./event/eventService');
var mongoService = require('./mongoService');

baseService.addStandardServiceMethods = function(service, dao){
    service.findById = function(id){
        return mongoService.findOneById(dao, id);
    };

    service.find = function(query, limit, offset, sort){
        return mongoService.find(dao, query, limit, offset, sort);
    };

    service.count = function(query){
        return mongoService.count(dao, query);
    };

    service.create = function(entity){
        return mongoService.savePromise(entity)
            .then(eventService.logCreateEntity);
    };

    service.update = function(entity){
        return mongoService.savePromise(entity)
            .then(eventService.logUpdateEntity);
    };

    service.remove = function(entity){
        return mongoService.removePromise(entity)
            .then(eventService.logDeleteEntity);
    };

    service.removeAll = function(query){
        return mongoService.removeAll(dao,query);
    };

    service.jsonToModel = function(json){
        return q(new dao(json));
    };

    service.mergeWithExisting = function(existingModel, updatedBody){
        return q(_.extend(existingModel, updatedBody));
    };

    service.distinctField = function(field){
        return mongoService.findDistinctByField(dao, field);
    };
};