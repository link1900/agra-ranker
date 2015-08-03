var mongoService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var eventService = require('./event/eventService');

mongoService.find = function(dao, search, limit, offset, sort){
    var deferred = q.defer();
    dao.find(search).limit(limit).skip(limit * offset).sort(sort).exec(function(err, results){
        if(err){
            deferred.reject(err);
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

mongoService.findAsStream = function(dao, search, limit, offset, sort){
    return dao.find(search).limit(limit).skip(limit * offset).sort(sort).stream();
};

mongoService.count = function(dao, search){
    var deferred = q.defer();
    dao.count(search).exec(function(err, result){
        if(err){
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

mongoService.oneExists = function(dao, search){
  return mongoService.findOne(dao, search).then(function(result){
      return result != null;
  });
};

mongoService.findOne = function(dao, search){
    var deferred = q.defer();
    dao.findOne(search, function(err, result){
        if(err){
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

mongoService.createSave = function(doc){
    var deferred = q.defer();
    doc.save(function(err, result){
        if(err){
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

mongoService.createMany = function(docs){
    return q.all(docs.forEach(mongoService.createSave));
};

mongoService.findOneAndCreate = function(dao, search, doc){
    var deferred = q.defer();
    var findOptions = {
        upsert: true
    };
    dao.findOneAndUpdate(search, doc, findOptions, function(err, result){
        if(err){
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

mongoService.findOneById = function(dao, id){
    var deferred = q.defer();
    dao.findById(id, function (err, model) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(model);
        }
    });
    return deferred.promise;
};

mongoService.removePromise = function(entity){
    var deferred = q.defer();
    entity.remove(function(err, removedModel){
        if (err){
            deferred.reject(err);
        } else {
            deferred.resolve(removedModel);
        }
    });
    return deferred.promise;
};

mongoService.savePromise = function(entity){
    var deferred = q.defer();
    entity.save(function(err, entity){
        if (err){
            deferred.reject(err);
        } else {
            deferred.resolve(entity);
        }
    });
    return deferred.promise;
};

mongoService.aggregatePromise = function(dao, aggregations){
    var deferred = q.defer();
    dao.aggregate(aggregations, function(err, entities){
        if (err){
            deferred.reject(err);
        } else {
            deferred.resolve(entities);
        }
    });
    return deferred.promise;
};

mongoService.aggregateSinglePromise = function(dao, aggregations){
    var deferred = q.defer();
    dao.aggregate(aggregations, function(err, entities){
        if (err){
            deferred.reject(err);
        } else {
            if (entities != null && entities.length == 1){
                deferred.resolve(entities[0]);
            } else {
                deferred.resolve(entities);
            }
        }
    });
    return deferred.promise;
};

mongoService.removeAll = function(dao, query){
    var deferred = q.defer();
    dao.remove(query, function (err) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(true);
        }
    });
    return deferred.promise;
};

mongoService.clearAwayChildren = function(dao, field, model){
    var deferred = q.defer();
    var query = {};
    query[field] = model._id;
    dao.find(query).exec(function(err, entities){
        if (err) {
            deferred.reject("cannot query this dao");
        } else {
            if (entities.length > 0){
                var promises = _.map(entities, function(entity){
                    return mongoService.removePromise(entity);
                });
                deferred.resolve(
                    q.all(promises).then(function(){
                        return model;
                    })
                );
            } else {
                deferred.resolve(q(model));
            }
        }
    });
    return deferred.promise;
};


mongoService.cleanFk = function(dao, field, model){
    var deferred = q.defer();
    var query = {};
    query[field] = model._id;
    dao.find(query).exec(function(err, entities){
        if (err) {
            deferred.reject("cannot query this dao");
        } else {
            if (entities.length > 0){
                var promises = _.map(entities, function(entity){
                    entity[field] = null;
                    return mongoService.savePromise(entity);
                });
                deferred.resolve(
                    q.all(promises).then(function(){
                        return model;
                    })
                );
            } else {
                deferred.resolve(q(model));
            }
        }
    });
    return deferred.promise;
};

mongoService.updateFlyweight = function(dao, ref, flyweightField, model){
    var deferred = q.defer();
    var query = {};
    query[ref] = model._id;
    dao.find(query).exec(function(err, entities){
        if (err) {
            deferred.reject("cannot query this dao");
        } else {
            if (entities.length > 0){
                var promises = _.map(entities, function(entity){
                    entity[flyweightField] = model;
                    return mongoService.savePromise(entity);
                });
                deferred.resolve(
                    q.all(promises).then(function(){
                        return model;
                    })
                );
            } else {
                deferred.resolve(q(model));
            }
        }
    });
    return deferred.promise;
};

mongoService.saveAll = function(entities){
    return _.reduce(entities, function(previousResult, currentValue) {
            return previousResult.then(function(){
                return mongoService.savePromise(currentValue);
            });
        },
        q()
    );
};

mongoService.saveAllAtOnce = function(entities){
    var proms = entities.map(function(entity){
        return mongoService.savePromise(entity);
    });
    return q.allSettled(proms);
};

mongoService.getCollectionCount = function(dao){
    var deferred = q.defer();
    mongoService.collectionExists(dao.collection.name).then(function(collectionExists){
        if (collectionExists){
            dao.collection.count(function(err, totalCount){
                if(err){
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

mongoService.getCollectionStats = function(dao){
    var deferred = q.defer();
    mongoService.collectionExists(dao.collection.name).then(function(collectionExists){
        if (collectionExists){
            dao.collection.stats(function(err, results){
                if(err){
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

mongoService.dropCollection = function(dao){
    var deferred = q.defer();
    mongoService.collectionExists(dao.collection.name).then(function(result){
        if (result){
            dao.collection.drop(function(err, results){
                if(err){
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

mongoService.collectionExists = function(collectionName){
    var deferred = q.defer();
    var db = mongoose.connection.db;
    db.collections(function(err, collections){
        if(err){
            deferred.reject(err);
        } else {
            var collectionNames = _.map(collections, function(collection){
                return collection.collectionName;
            });
            var result = _.contains(collectionNames, collectionName);
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

mongoService.findDistinctByField = function(dao, field, query){
    var deferred = q.defer();
    if (query == null){
        query = {};
    }
    dao.distinct(field, query, function(err, results){
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

