const baseService = module.exports = {};
const q = require('q');
const _ = require('lodash');
const eventService = require('./event/eventService');
const mongoService = require('./mongoService');

baseService.addStandardServiceMethods = function (service, Dao) {
    service.findById = function (id) {
        return mongoService.findOneById(Dao, id);
    };

    service.find = function (query, limit, offset, sort) {
        return mongoService.find(Dao, query, limit, offset, sort);
    };

    service.findAsStream = function (query, limit, offset, sort) {
        return mongoService.findAsStream(Dao, query, limit, offset, sort);
    };

    service.count = function (query) {
        return mongoService.count(Dao, query);
    };

    service.create = function (entity) {
        return mongoService.savePromise(entity)
            .then(eventService.logCreateEntity);
    };

    service.createFromJson = function (json) {
        return service.jsonToModel(json)
            .then(service.create);
    };

    service.updateFromJson = function (existingModel, updatedBody) {
        return service.mergeWithExisting(existingModel, updatedBody)
            .then(service.update);
    };

    service.update = function (entity) {
        return mongoService.savePromise(entity)
            .then(eventService.logUpdateEntity);
    };

    service.updateNoLog = function (entity) {
        return mongoService.savePromise(entity);
    };

    service.remove = function (entity) {
        return mongoService.removePromise(entity)
            .then(eventService.logDeleteEntity);
    };

    service.removeAll = function (query) {
        return mongoService.removeAll(Dao, query);
    };

    service.jsonToModel = function (json) {
        return q(new Dao(json));
    };

    service.mergeWithExisting = function (existingModel, updatedBody) {
        return q(_.extend(existingModel, updatedBody));
    };

    service.distinctField = function (field, query) {
        return mongoService.findDistinctByField(Dao, field, query);
    };

    service.aggregate = function (aggregations) {
        return mongoService.aggregatePromise(Dao, aggregations);
    };

    service.lastUpdatedRecord = function () {
        return service.find({}, 1, 0, { updatedAt: -1 }).then((lastRecords) => {
            if (lastRecords != null && lastRecords.length > 0) {
                return lastRecords[0];
            } else {
                return null;
            }
        });
    };

    service.collectionFingerPrint = function () {
        return service.count().then((count) => {
            if (count > 0) {
                return service.lastUpdatedRecord().then((lastRecord) => {
                    if (lastRecord != null && lastRecord.updatedAt != null) {
                        let baseFingerPrint = '';
                        baseFingerPrint += lastRecord.updatedAt.getTime().toString();
                        baseFingerPrint += count.toString();
                        return new Buffer(baseFingerPrint).toString('base64');
                    } else {
                        return q.reject('record does not have updatedAt or there are no records');
                    }
                });
            } else {
                return q.reject('cannot generate finger print for collection as there are no records');
            }
        });
    };
};
