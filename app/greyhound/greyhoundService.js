var greyhoundService = module.exports = {};

var mongoose = require('mongoose');
var Greyhound = require('./greyhound').model;
var Placing = mongoose.model('Placing');
var _ = require('lodash');
var helper = require('../helper');
var q = require('q');
var mongoHelper = require('../mongoHelper');

greyhoundService.rawCsvArrayToGreyhound = function(rawRow){
    var greyhound = {
        name : rawRow[0],
        sire: {name: rawRow[1]},
        dam: {name:rawRow[2]}
    };

    if (greyhound.name){
        greyhound.name = greyhound.name.toLowerCase().trim();
    }
    if (greyhound.sire.name){
        greyhound.sire.name = greyhound.sire.name.toLowerCase().trim();
    }
    if (greyhound.dam.name){
        greyhound.dam.name = greyhound.dam.name.toLowerCase().trim();
    }

    //check fields
    if (greyhound.name.length == 0){
        return null;
    }
    if (greyhound.sire.name.length == 0){
        delete greyhound.sire;
    }
    if (greyhound.dam.name.length == 0){
        delete greyhound.dam;
    }
    return greyhound;
};

greyhoundService.processGreyhoundImportObject = function(greyhound){
    var parentPromises = [];
    if (greyhound.sire){
        parentPromises.push(greyhoundService.saveOrFindGreyhoundImportObject(greyhound.sire));
    }
    if (greyhound.dam){
        parentPromises.push(greyhoundService.saveOrFindGreyhoundImportObject (greyhound.dam));
    }

    return q.all(parentPromises).then(function(parentResults){
        if (parentResults.length > 0){
            greyhound.sireRef = parentResults[0]._id;
        }

        if (parentResults.length > 1){
            greyhound.damRef = parentResults[1]._id;
        }

        return greyhoundService.saveOrFindGreyhoundImportObject(greyhound);
    });
};

greyhoundService.newGreyhound = function(json){
    return new Greyhound(json);
};

greyhoundService.saveOrFindGreyhoundImportObject = function(greyhound){
    greyhound = greyhoundService.newGreyhound(greyhound);
    return greyhoundService.findExisting(greyhound).then(mongoHelper.savePromise);
};

greyhoundService.findExisting = function(greyhound) {
    var deferred = q.defer();
    Greyhound.findOne({"name":greyhound.name}, function(err, existingGreyhound) {
        if (err) {
            deferred.reject('error checking greyhound name ' + greyhound.name);
        }
        if (existingGreyhound) {
            deferred.resolve(existingGreyhound);
        }
        deferred.resolve(greyhound);

    });
    return deferred.promise;
};

greyhoundService.saveGreyhoundImportObject = function(greyhound){
    greyhound = greyhoundService.newGreyhound(greyhound);
    return greyhoundService.checkForExistsImport(greyhound).then(mongoHelper.savePromise);
};

greyhoundService.checkForExistsImport = function(greyhound) {
    var deferred = q.defer();
    Greyhound.findOne({"name":greyhound.name}, function(err, existingGreyhound) {
        if (err) {
            deferred.reject('error checking greyhound name ' + greyhound.name);
        }
        if (existingGreyhound) {
            deferred.reject('greyhound already exist with the name ' + existingGreyhound.name);
        }
        deferred.resolve(greyhound);

    });
    return deferred.promise;
};
