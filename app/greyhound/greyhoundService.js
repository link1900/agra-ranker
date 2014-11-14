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

greyhoundService.createGreyhoundByName = function(greyhoundName){
    return mongoHelper.findOne(Greyhound, {name: greyhoundName}).then(function(possibleGreyhound){
        if (possibleGreyhound != null){
            return {
                model : possibleGreyhound,
                details: "Found existing greyhound \"" + possibleGreyhound.name + "\" skipping greyhound creation"
            };
        } else {
            return mongoHelper.savePromise(new Greyhound({name: greyhoundName})).then(function(saveResult){
                return {
                    model : saveResult,
                    details: "Created greyhound \"" + saveResult.name + "\""
                };
            });
        }
    });
};

greyhoundService.createStep = function(batchRecord){
    return greyhoundService.createGreyhoundByName(batchRecord.greyhoundRecord.name).then(function(greyhoundImportResult) {
        batchRecord.createdGreyhound = greyhoundImportResult.model;
        batchRecord.stepResults.push(greyhoundImportResult.details);
        return batchRecord;
    },function(creationFailure){
        console.log(creationFailure);
        batchRecord.stepResults.push("Failed to create greyhound \"" + batchRecord.greyhoundRecord.name + "\" error:" + creationFailure);
        return q.reject(batchRecord);
    });
};

greyhoundService.createSireStep = function(batchRecord){
    if (batchRecord.greyhoundRecord.sire != null && batchRecord.createdGreyhound != null){
        return greyhoundService.createGreyhoundByName(batchRecord.greyhoundRecord.sire.name).then(function(sireImportResult) {
            batchRecord.createdSire = sireImportResult.model;
            batchRecord.stepResults.push(sireImportResult.details);
            return batchRecord;
        }, function(creationFailure){
            console.log(creationFailure);
            batchRecord.stepResults.push("Failed to create sire greyhound \"" + batchRecord.greyhoundRecord.name + "\" error:" + creationFailure);
            return q.reject(batchRecord);
        });
    } else {
        return q(batchRecord);
    }
};

greyhoundService.setSireStep = function(batchRecord){
    if (batchRecord.createdSire != null && batchRecord.createdGreyhound != null){
        batchRecord.createdGreyhound.sireRef = batchRecord.createdSire._id;
        return mongoHelper.savePromise(batchRecord.createdGreyhound).then(function(updatedGreyhound){
            batchRecord.createdGreyhound = updatedGreyhound;
            batchRecord.stepResults.push("Updated \"" + updatedGreyhound.name + "\" to have sire \"" + batchRecord.createdSire.name + "\"");
            return batchRecord;
        }, function(updateSireError){
            console.log(updateSireError);
            batchRecord.stepResults.push("Failed to update sire for \"" + batchRecord.createdGreyhound.name + "\" error:" + updateSireError);
            return q.reject(batchRecord);
        });
    } else {
        return q(batchRecord);
    }
};

greyhoundService.createDamStep = function(batchRecord){
    if (batchRecord.greyhoundRecord.dam != null && batchRecord.createdGreyhound != null){
        return greyhoundService.createGreyhoundByName(batchRecord.greyhoundRecord.dam.name).then(function(damImportResult) {
            batchRecord.createdDam = damImportResult.model;
            batchRecord.stepResults.push(damImportResult.details);
            return batchRecord;
        }, function(creationFailure){
            console.log(creationFailure);
            batchRecord.stepResults.push("Failed to create dam greyhound \"" + batchRecord.greyhoundRecord.name + "\" error:" + creationFailure);
            return q.reject(batchRecord);
        });
    } else {
        return q(batchRecord);
    }
};

greyhoundService.setDamStep = function(batchRecord){
    if (batchRecord.createdDam != null && batchRecord.createdGreyhound != null){
        batchRecord.createdGreyhound.damRef = batchRecord.createdDam._id;
        return mongoHelper.savePromise(batchRecord.createdGreyhound).then(function(updatedGreyhound){
            batchRecord.createdGreyhound = updatedGreyhound;
            batchRecord.stepResults.push("Updated \"" + updatedGreyhound.name + "\" to have dam \"" + batchRecord.createdDam.name + "\"");
            return batchRecord;
        }, function(updateSireError){
            console.log(updateSireError);
            batchRecord.stepResults.push("Failed to update dam for \"" + batchRecord.createdGreyhound.name + "\" error:" + updateSireError);
            return q.reject(batchRecord);
        });
    } else {
        return q(batchRecord);
    }
};

greyhoundService.processGreyhoundRow = function(record){
    var batchRecord = {stepResults: [], greyhoundRecord: greyhoundService.rawCsvArrayToGreyhound(record)};
    return greyhoundService.createStep(batchRecord)
        .then(greyhoundService.createSireStep)
        .then(greyhoundService.setSireStep)
        .then(greyhoundService.createDamStep)
        .then(greyhoundService.setDamStep)
        .then(function(finalBatchRecord){
            return {isSuccessful : true, stepResults: finalBatchRecord.stepResults};
        }).fail(function(importError){
            console.log("error importing greyhound csv", importError);
            return q({isSuccessful : false, stepResults: [JSON.stringify(importError)]});
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

var BatchJob = require('../batch/batchJob').model;
var BatchResult = require('../batch/batchResult').model;
var batchService = require('../batch/batchService');
var csv = require('csv');
var grid = require('gridfs-stream');
var gfs = grid(mongoose.connection.db);

greyhoundService.processGreyhoundCSV = function(batchJob){
    var deferred = q.defer();
    if (batchJob.type != null &&
        batchJob.type == "importGreyhoundCSV" &&
        batchJob.metadata != null &&
        batchJob.metadata.fileId != null){
        //find the file and stream it in
        var fileReadStream = gfs.createReadStream({_id: batchJob.metadata.fileId});
        var recordCount = 0;
        fileReadStream.on('error', function(fileReadError){
            console.log("error streaming from gridfs", fileReadError);
            deferred.reject(fileReadError);
        });

        var parser = csv.parse();

        parser.on('data', function(record){
            parser.pause();
            recordCount += 1;
            var index = recordCount;
            var recordStart = new Date();
            return greyhoundService.processGreyhoundRow(record).then(function(resultInfo) {
                var resultType = batchService.getBatchResultFromBoolean(resultInfo.isSuccessful);
                var batchResult = new BatchResult({
                    batchRef: batchJob._id,
                    recordNumber: index,
                    status: resultType,
                    startDate: recordStart,
                    endDate: new Date(),
                    raw: record,
                    stepResults: resultInfo.stepResults
                });
                return mongoHelper.savePromise(batchResult).then(function(){
                    parser.resume();
                });
            });
        });

        parser.on('finish', function(){
            deferred.resolve({results: true});
        });

        parser.on('error', function(parserError){
            console.log("error parsing csv", parserError);
            deferred.reject(parserError);
        });

        fileReadStream.pipe(parser);
    } else {
        deferred.reject({error: "batch job does not contain enough data to process"});
    }
    return deferred.promise;
};

batchService.loadBatchHandler("importGreyhoundCSV", greyhoundService.processGreyhoundCSV);