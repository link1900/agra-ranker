const migration = module.exports = {};

const q = require('q');
const mongoose = require('mongoose');

const db = mongoose.connection.db;

migration.up = function () {
    return migration.findRaces().then((races) => {
        const proms = races.map((race) => {
            race.groupLevelName = race.groupLevel.name;
            delete race.groupLevel;
            delete race.groupLevelRef;
            return migration.save(race);
        });
        return q.allSettled(proms);
    });
};

migration.save = function (doc) {
    const deferred = q.defer();
    const raceCollection = db.collection('races');
    raceCollection.save(doc, (err, result) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

migration.findRaces = function () {
    const deferred = q.defer();
    const query = { $and: [{ 'groupLevel.name': { $exists: true } }, { groupLevelName: { $exists: false } }] };
    const raceCollection = db.collection('races');
    raceCollection.find(query).toArray((err, results) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};
