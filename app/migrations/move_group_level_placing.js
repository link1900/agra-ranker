const migration = module.exports = {};

const q = require('q');

const mongoose = require('mongoose');
const db = mongoose.connection.db;

migration.up = function () {
    return migration.findPlacings().then((placings) => {
        const proms = placings.map((placing) => {
            placing.race.groupLevelName = placing.race.groupLevel.name;
            delete placing.race.groupLevel;
            delete placing.race.groupLevelRef;
            return migration.save(placing);
        });
        return q.allSettled(proms);
    });
};

migration.save = function (doc) {
    const deferred = q.defer();
    const placingCollection = db.collection('placings');
    placingCollection.save(doc, (err, result) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

migration.findPlacings = function () {
    const deferred = q.defer();
    const query = { $and: [{ 'race.groupLevel.name': { $exists: true } }, { 'race.groupLevelName': { $exists: false } }] };
    const placingCollection = db.collection('placings');
    placingCollection.find(query).toArray((err, results) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};
