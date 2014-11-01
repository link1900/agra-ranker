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

