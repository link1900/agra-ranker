const mongoService = module.exports = {};

const _ = require('lodash');
const q = require('q');
const mongoose = require('mongoose');

mongoose.Promise = Promise;
const ObjectId = mongoose.Types.ObjectId;

mongoService.find = function (dao, search, limit, offset, sort) {
    const deferred = q.defer();
    dao.find(search).limit(limit).skip(limit * offset).sort(sort).exec((err, results) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

mongoService.findAsStream = function (dao, search, limit, offset, sort) {
    return dao.find(search).limit(limit).skip(limit * offset).sort(sort).stream();
};

mongoService.count = function (dao, search) {
    const deferred = q.defer();
    dao.count(search).exec((err, result) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

mongoService.oneExists = function (dao, search) {
    return mongoService.findOne(dao, search).then((result) => {
        return result != null;
    });
};

mongoService.findOne = function (dao, search) {
    const deferred = q.defer();
    dao.findOne(search, (err, result) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

mongoService.createSave = function (doc) {
    const deferred = q.defer();
    doc.save((err, result) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

mongoService.createMany = function (docs) {
    return q.all(docs.forEach(mongoService.createSave));
};

mongoService.findOneAndCreate = function (dao, search, doc) {
    const deferred = q.defer();
    const findOptions = {
        upsert: true
    };
    dao.findOneAndUpdate(search, doc, findOptions, (err, result) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

mongoService.findOneById = function (dao, id) {
    const deferred = q.defer();
    dao.findById(id, (err, model) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(model);
        }
    });
    return deferred.promise;
};

mongoService.removePromise = function (entity) {
    const deferred = q.defer();
    entity.remove((err, removedModel) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(removedModel);
        }
    });
    return deferred.promise;
};

mongoService.savePromise = function (entity) {
    const deferred = q.defer();
    entity.save((err, updatedEntity) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(updatedEntity);
        }
    });
    return deferred.promise;
};

mongoService.aggregatePromise = function (dao, aggregations) {
    const deferred = q.defer();
    dao.aggregate(aggregations, (err, entities) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(entities);
        }
    });
    return deferred.promise;
};

mongoService.aggregateSinglePromise = function (dao, aggregations) {
    const deferred = q.defer();
    dao.aggregate(aggregations, (err, entities) => {
        if (err) {
            deferred.reject(err);
        } else if (entities && entities.length === 1) {
            deferred.resolve(entities[0]);
        } else {
            deferred.resolve(entities);
        }
    });
    return deferred.promise;
};

mongoService.removeAll = function (dao, query) {
    const deferred = q.defer();
    dao.remove(query, (err) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(true);
        }
    });
    return deferred.promise;
};

mongoService.clearAwayChildren = function (dao, field, model) {
    const deferred = q.defer();
    const query = {};
    query[field] = model._id;
    dao.find(query).exec((err, entities) => {
        if (err) {
            deferred.reject('cannot query this dao');
        } else if (entities.length > 0) {
            const promises = _.map(entities, (entity) => {
                return mongoService.removePromise(entity);
            });
            deferred.resolve(
                    q.all(promises).then(() => {
                        return model;
                    })
                );
        } else {
            deferred.resolve(q(model));
        }
    });
    return deferred.promise;
};


mongoService.cleanFk = function (dao, field, model) {
    const deferred = q.defer();
    const query = {};
    query[field] = model._id;
    dao.find(query).exec((err, entities) => {
        if (err) {
            deferred.reject('cannot query this dao');
        } else if (entities.length > 0) {
            const promises = _.map(entities, (entity) => {
                entity[field] = null;
                return mongoService.savePromise(entity);
            });
            deferred.resolve(
                    q.all(promises).then(() => {
                        return model;
                    })
                );
        } else {
            deferred.resolve(q(model));
        }
    });
    return deferred.promise;
};

mongoService.updateFlyweight = function (dao, ref, flyweightField, model) {
    const deferred = q.defer();
    const query = {};
    query[ref] = model._id;
    dao.find(query).exec((err, entities) => {
        if (err) {
            deferred.reject('cannot query this dao');
        } else if (entities.length > 0) {
            const promises = _.map(entities, (entity) => {
                entity[flyweightField] = model;
                return mongoService.savePromise(entity);
            });
            deferred.resolve(
                    q.all(promises).then(() => {
                        return model;
                    })
                );
        } else {
            deferred.resolve(q(model));
        }
    });
    return deferred.promise;
};

mongoService.saveAll = function (entities) {
    return _.reduce(entities, (previousResult, currentValue) => {
        return previousResult.then(() => {
            return mongoService.savePromise(currentValue);
        });
    },
        q()
    );
};

mongoService.saveAllAtOnce = function (entities) {
    const proms = entities.map((entity) => {
        return mongoService.savePromise(entity);
    });
    return q.allSettled(proms);
};

mongoService.getCollectionCount = function (dao) {
    const deferred = q.defer();
    mongoService.collectionExists(dao.collection.name).then((collectionExists) => {
        if (collectionExists) {
            dao.collection.count((err, totalCount) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(totalCount);
                }
            });
        } else {
            deferred.resolve(0);
        }
    });
    return deferred.promise;
};

mongoService.getCollectionStats = function (dao) {
    const deferred = q.defer();
    mongoService.collectionExists(dao.collection.name).then((collectionExists) => {
        if (collectionExists) {
            dao.collection.stats((err, results) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(results);
                }
            });
        } else {
            deferred.resolve({});
        }
    });
    return deferred.promise;
};

mongoService.dropCollection = function (dao) {
    const deferred = q.defer();
    mongoService.collectionExists(dao.collection.name).then((result) => {
        if (result) {
            dao.collection.drop((err, results) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(results);
                }
            });
        } else {
            deferred.resolve(true);
        }
    });
    return deferred.promise;
};

mongoService.collectionExists = function (collectionName) {
    const deferred = q.defer();
    const db = mongoose.connection.db;
    db.collections((err, collections) => {
        if (err) {
            deferred.reject(err);
        } else {
            const collectionNames = _.map(collections, (collection) => {
                return collection.collectionName;
            });
            const result = _.includes(collectionNames, collectionName);
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

mongoService.findDistinctByField = function (dao, field, query) {
    const deferred = q.defer();
    if (query == null) {
        query = {};
    }
    dao.distinct(field, query, (err, results) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

mongoService.isObjectId = function (objectId) {
    if (objectId && objectId.toString) {
        return ObjectId.isValid(objectId.toString());
    } else {
        return false;
    }
};

