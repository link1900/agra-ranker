var migration = module.exports = {};

var q = require('q');

var mongoose = require('mongoose');
var db = mongoose.connection.db;

migration.up = function(){
    return migration.findPlacings().then(function(placings){
        var proms = placings.map(function(placing){
            placing.race.groupLevelName = placing.race.groupLevel.name;
            delete placing.race.groupLevel;
            delete placing.race.groupLevelRef;
            return migration.save(placing);
        });
        return q.allSettled(proms);
    });
};

migration.save = function(doc){
    var deferred = q.defer();
    var placingCollection = db.collection('placings');
    placingCollection.save(doc, function(err, result){
        if (err){
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

migration.findPlacings = function(){
    var deferred = q.defer();
    var query = { "$and": [{"race.groupLevel.name": {$exists : true}}, {"race.groupLevelName": {$exists : false}}]};
    var placingCollection = db.collection('placings');
    placingCollection.find(query).toArray(function(err, results) {
        if (err){
            deferred.reject(err);
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};