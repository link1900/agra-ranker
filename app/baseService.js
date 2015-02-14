var baseService = module.exports = {};
var eventService = require('./event/eventService');
var mongoService = require('./mongoService');

baseService.addStandardServiceMethods = function(service, dao){
    service.count = function(){
        return mongoService.getCollectionCount(dao);
    };

    service.findById = function(id){
        return mongoService.findOneById(dao, id);
    };

    service.find = function(query, limit, offset, sort){
        return mongoService.find(dao, query, limit, offset, sort);
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
};