var raceService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var moment = require('moment');
var logger = require('winston');
var validator = require('validator');
var Race = require('./race').model;
var batchService = require('../batch/batchService');
var placingService = require('../placing/placingService');
var baseService = require('../baseService');

baseService.addStandardServiceMethods(raceService, Race);

raceService.createRaceFromJson = function (raceJson) {
    return raceService.jsonToModel(raceJson)
        .then(raceService.validateRace)
        .then(raceService.checkNameAndDateDoNotExist)
        .then(raceService.create);
};

raceService.updateRaceFromJson = function (existingModel, raceJson) {
    return raceService.mergeWithExisting(existingModel, raceJson)
        .then(raceService.validateRace)
        .then(raceService.checkNameAndDateDoNotExist)
        .then(raceService.update);
};

raceService.validateRace = function (race) {
    if (!race.name) {
        return q.reject("name field is required");
    }

    if (race.name.length == 0) {
        return q.reject("name cannot be blank");
    }

    if (!race.date) {
        return q.reject("must have a date");
    }

    if (!race.groupLevelName) {
        return q.reject("must have a group level");
    }

    var validGroupLevels = ["Group 1", "Group 2", "Group 3", "Listed"];
    if (race.groupLevelName && !_.contains(validGroupLevels, race.groupLevelName)) {
        return q.reject("race group level was " + race.groupLevelName + " and must be one of " + validGroupLevels);
    }

    if (!race.distanceMeters) {
        return q.reject("must have a distance meters");
    }

    if (race.disqualified == undefined || race.disqualified == null) {
        return q.reject("must have a disqualified");
    }

    return q(race);
};

raceService.processRaceCsvRow = function (record) {
    var batchRecord = {stepResults: [], record: raceService.rawCsvArrayToRaceText(record)};
    return raceService.setRaceObject(batchRecord)
        .then(raceService.setGroupLevel)
        .then(raceService.setRaceDate)
        .then(raceService.checkForDuplicateRace)
        .then(raceService.setRaceLength)
        .then(raceService.createRaceForBatch)
        .then(raceService.createPlacingsForBatch)
        .then(function (finalBatchRecord) {
            return {isSuccessful: true, stepResults: finalBatchRecord.stepResults};
        }).fail(function (error) {
            var errorResults = [];
            if (error == null || error.stepResults == null) {
                errorResults = [error];
            } else {
                errorResults = error.stepResults;
            }
            logger.log("info", "error importing race csv record: " + record + " reason: " + errorResults);
            return q({isSuccessful: false, stepResults: errorResults});
        });
};

raceService.setRaceObject = function (batchRecord) {
    if (batchRecord.record.name != null) {
        batchRecord.race = new Race({"name": batchRecord.record.name});
        return q(batchRecord);
    } else {
        var failure = "Failed to create race. Record is missing race name";
        logger.log("info", failure);
        batchRecord.stepResults.push(failure);
        return q.reject(batchRecord);
    }
};

raceService.checkForDuplicateRace = function (batchRecord) {
    return raceService.checkNameAndDateDoNotExist(batchRecord.race).then(function () {
        return q(batchRecord);
    }, function () {
        var failure = "Failed to create race. Race with a matching name and date already exists";
        logger.log("info", failure);
        batchRecord.stepResults.push(failure);
        return q.reject(batchRecord);
    });
};

raceService.setGroupLevel = function (batchRecord) {
    if (batchRecord.record.groupText != null) {
        batchRecord.race.groupLevelName = batchRecord.record.groupText;
        return q(batchRecord);
    } else {
        var failure = "Failed to create race. Record is missing group level";
        logger.log("info", failure);
        batchRecord.stepResults.push(failure);
        return q.reject(batchRecord);
    }
};

raceService.setRaceDate = function (batchRecord) {
    if (batchRecord.record.dateText != null) {
        var aDate = moment(batchRecord.record.dateText, "DD/MM/YYYY");
        if (aDate.isValid()) {
            batchRecord.race.date = aDate.toDate();
            return q(batchRecord);
        } else {
            var parseFailure = "Failed to create race. Record has invalid race date";
            logger.log("info", parseFailure);
            batchRecord.stepResults.push(parseFailure);
            return q.reject(batchRecord);
        }
    } else {
        var failure = "Failed to create race. Record is missing race date";
        logger.log("info", failure);
        batchRecord.stepResults.push(failure);
        return q.reject(batchRecord);
    }
};

raceService.setRaceLength = function (batchRecord) {
    if (batchRecord.record.lengthText != null) {
        if (batchRecord.record.lengthText == 'Distance') {
            batchRecord.race.distanceMeters = 595;
        } else {
            batchRecord.race.distanceMeters = 500;
        }
        return q(batchRecord);
    } else {
        var failure = "Failed to create race. Record is missing length text";
        logger.log("info", failure);
        batchRecord.stepResults.push(failure);
        return q.reject(batchRecord);
    }
};

raceService.createRaceForBatch = function (batchRecord) {
    return raceService.create(batchRecord.race).then(function () {
        return q(batchRecord);
    });
};

raceService.createPlacingsForBatch = function (batchRecord) {
    if (batchRecord.record != null && batchRecord.record.placingObjects != null && batchRecord.record.placingObjects.length > 0) {
        var proms = batchRecord.record.placingObjects.map(function (placingObject) {
            return raceService.createPlacingFromBatch(batchRecord.race, placingObject);
        });
        return q.allSettled(proms).then(function (results) {
            var failures = results.filter(function (i) {
                return i.state == "rejected";
            });
            failures = failures.map(function (i) {
                return "failed to create placing: " + i.reason;
            });
            if (failures.length > 0) {
                batchRecord.stepResults.push(failures);
                return q.reject(batchRecord);
            } else {
                return q(batchRecord);
            }
        });
    } else {
        return q(batchRecord);
    }
};

raceService.createPlacingFromBatch = function (race, placingObject) {
    if (race != null && race._id != null) {
        placingObject.raceRef = race._id;
        return placingService.createPlacing(placingObject);
    } else {
        return q.reject("cant create placing without race");
    }
};

raceService.rawCsvArrayToRaceText = function (rawRow) {
    var race = {
        name: rawRow[0],
        dateText: rawRow[1],
        groupText: rawRow[2],
        lengthText: rawRow[3]
    };

    race.placingObjects = [];
    var placingArray = rawRow.slice(4);
    for (var i = 0; i < placingArray.length; i++) {
        var nextPlacing = {};
        nextPlacing.greyhoundName = placingArray[i].toUpperCase().trim();
        if (i + 1 < placingArray.length) {
            nextPlacing.placing = placingArray[i + 1];
            i++;
        }
        if (!validator.isNull(nextPlacing.greyhoundName) &&
            validator.isLength(nextPlacing.greyhoundName, 1) && !validator.isNull(nextPlacing.placing) &&
            validator.isLength(nextPlacing.placing, 1)
        ) {
            race.placingObjects.push(nextPlacing);
        }
    }

    if (race.name != null) {
        race.name = race.name.trim();
    }
    if (race.dateText) {
        race.dateText = race.dateText.trim();
    }
    if (race.groupText) {
        race.groupText = race.groupText.trim();
    }
    if (race.lengthText) {
        race.lengthText = race.lengthText.trim();
    }

    return race;
};

raceService.checkNameAndDateDoNotExist = function (model) {
    return raceService.find({name: model.name, date: model.date}).then(function (results) {
        if (results.length == 0) {
            return q(model);
        } else if (results.length == 1 && _.isEqual(results[0]._id, model._id)) {
            return q(model);
        } else {
            return q.reject("cannot have the same name and date as an existing race");
        }
    });
};

raceService.importRaceCSV = function (batchJob) {
    return batchService.processBatchJobFile(batchJob, raceService.processRaceCsvRow);
};

batchService.loadBatchHandler("importRaceCSV", raceService.importRaceCSV);

raceService.toExportFormat = function (raceRecord) {
    var exportRecord = {};
    exportRecord.name = raceRecord.name;
    exportRecord.date = moment(raceRecord.date).format('LLL');
    exportRecord.group = raceRecord.groupLevelName;
    exportRecord.length = raceRecord.distanceMeters;
    return exportRecord;
};