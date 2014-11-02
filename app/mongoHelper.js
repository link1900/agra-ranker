var mongoHelper = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var db = mongoose.connection.db;

mongoHelper.find = function(dao, search){
    var deferred = q.defer();
    dao.find(search).exec(function(err, results){
        if(err){
            deferred.reject(err);
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

mongoHelper.oneExists = function(dao, search){
  return mongoHelper.findOne(dao, search).then(function(result){
      return result != null;
  });
};

mongoHelper.findOne = function(dao, search){
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

mongoHelper.findOneById = function(dao, id){
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

mongoHelper.removePromise = function(entity){
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

mongoHelper.savePromise = function(entity){
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

mongoHelper.aggregatePromise = function(dao, aggregations){
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

mongoHelper.aggregateSinglePromise = function(dao, aggregations){
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

mongoHelper.removeAll = function(dao, query){
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

mongoHelper.clearAwayChildren = function(dao, field, model){
    var deferred = q.defer();
    var query = {};
    query[field] = model._id;
    dao.find(query).exec(function(err, entities){
        if (err) {
            deferred.reject("cannot query this dao");
        } else {
            if (entities.length > 0){
                var promises = _.map(entities, function(entity){
                    return mongoHelper.removePromise(entity);
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


mongoHelper.cleanFk = function(dao, field, model){
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
                    return mongoHelper.savePromise(entity);
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

mongoHelper.updateFlyweight = function(dao, ref, flyweightField, model){
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
                    return mongoHelper.savePromise(entity);
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

mongoHelper.saveAll = function(entities){
    return _.reduce(entities, function(previousResult, currentValue) {
            return previousResult.then(function(){
                return mongoHelper.savePromise(currentValue);
            });
        },
        q()
    );
};

mongoHelper.dropCollection = function(dao){
    var deferred = q.defer();
    mongoHelper.collectionExists(dao.collection.name).then(function(result){
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

mongoHelper.collectionExists = function(collectionName){
    var deferred = q.defer();
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

