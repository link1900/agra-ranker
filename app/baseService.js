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

    service.findAsStream = function(query, limit, offset, sort){
        return mongoService.findAsStream(dao, query, limit, offset, sort);
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

    service.distinctField = function(field, query){
        return mongoService.findDistinctByField(dao, field, query);
    };

    service.aggregate = function(aggregations){
        return mongoService.aggregatePromise(dao, aggregations);
    };

    service.lastUpdatedRecord = function(){
        return service.find({}, 1, 0, {"updatedAt":-1}).then(function(lastRecords){
            if (lastRecords != null && lastRecords.length > 0){
                return lastRecords[0];
            } else {
                return null;
            }
        });
    };

    service.collectionFingerPrint = function(){
        return service.count().then(function(count){
            if (count > 0){
                return service.lastUpdatedRecord().then(function(lastRecord){
                    if (lastRecord != null && lastRecord.updatedAt != null){
                        var baseFingerPrint = "";
                        baseFingerPrint += lastRecord.updatedAt.getTime().toString();
                        baseFingerPrint += count.toString();
                        return new Buffer(baseFingerPrint).toString('base64');
                    } else {
                        return q.reject("record does not have updatedAt or there are no records");
                    }
                });
            } else {
                return q.reject("cannot generate finger print for collection as there are no records");
            }
        });
    };
};