var migration = module.exports = {};

var q = require('q');

var mongoose = require('mongoose');
var db = mongoose.connection.db;

migration.up = function(){
    return migration.findRaces().then(function(races){
        var proms = races.map(function(race){
            race.groupLevelName = race.groupLevel.name;
            delete race.groupLevel;
            delete race.groupLevelRef;
            return migration.save(race);
        });
        return q.allSettled(proms);
    });
};

migration.save = function(doc){
    var deferred = q.defer();
    var raceCollection = db.collection('races');
    raceCollection.save(doc, function(err, result){
        if (err){
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

migration.findRaces = function(){
    var deferred = q.defer();
    var query = { "$and": [{"groupLevel.name": {$exists : true}}, {"groupLevelName": {$exists : false}}]};
    var raceCollection = db.collection('races');
    raceCollection.find(query).toArray(function(err, results) {
        if (err){
            deferred.reject(err);
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};