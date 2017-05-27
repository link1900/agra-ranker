const raceService = module.exports = {};

const _ = require('lodash');
const q = require('q');
const moment = require('moment-timezone');
const logger = require('winston');
const Race = require('./race').model;
const placingService = require('../placing/placingService');
const baseService = require('../baseService');

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
        return q.reject('name field is required');
    }

    if (race.name.length === 0) {
        return q.reject('name cannot be blank');
    }

    if (!race.date) {
        return q.reject('must have a date');
    }

    if (!race.groupLevelName) {
        return q.reject('must have a group level');
    }

    const validGroupLevels = ['Group 1', 'Group 2', 'Group 3', 'Listed'];
    if (race.groupLevelName && !_.includes(validGroupLevels, race.groupLevelName)) {
        return q.reject(`race group level was ${race.groupLevelName} and must be one of ${validGroupLevels}`);
    }

    if (!race.distanceMeters) {
        return q.reject('must have a distance meters');
    }

    if (race.disqualified === undefined || race.disqualified === null) {
        return q.reject('must have a disqualified');
    }

    return q(race);
};

raceService.setRaceObject = function (batchRecord) {
    if (batchRecord.record.name != null) {
        batchRecord.race = new Race({ name: batchRecord.record.name });
        return q(batchRecord);
    } else {
        const failure = 'Failed to create race. Record is missing race name';
        logger.log('info', failure);
        batchRecord.stepResults.push(failure);
        return q.reject(batchRecord);
    }
};

raceService.checkForDuplicateRace = function (batchRecord) {
    return raceService.checkNameAndDateDoNotExist(batchRecord.race).then(() => {
        return q(batchRecord);
    }, () => {
        const failure = 'Failed to create race. Race with a matching name and date already exists';
        logger.log('info', failure);
        batchRecord.stepResults.push(failure);
        return q.reject(batchRecord);
    });
};

raceService.setGroupLevel = function (batchRecord) {
    if (batchRecord.record.groupText != null) {
        batchRecord.race.groupLevelName = batchRecord.record.groupText;
        return q(batchRecord);
    } else {
        const failure = 'Failed to create race. Record is missing group level';
        logger.log('info', failure);
        batchRecord.stepResults.push(failure);
        return q.reject(batchRecord);
    }
};

raceService.setRaceDate = function (batchRecord) {
    if (batchRecord.record.dateText != null) {
        const aDate = moment(batchRecord.record.dateText, 'DD/MM/YYYY');
        if (aDate.isValid()) {
            batchRecord.race.date = aDate.toDate();
            return q(batchRecord);
        } else {
            const parseFailure = 'Failed to create race. Record has invalid race date';
            logger.log('info', parseFailure);
            batchRecord.stepResults.push(parseFailure);
            return q.reject(batchRecord);
        }
    } else {
        const failure = 'Failed to create race. Record is missing race date';
        logger.log('info', failure);
        batchRecord.stepResults.push(failure);
        return q.reject(batchRecord);
    }
};

raceService.setRaceLength = function (batchRecord) {
    if (batchRecord.record.lengthText != null) {
        if (batchRecord.record.lengthText === 'Distance') {
            batchRecord.race.distanceMeters = 595;
        } else {
            batchRecord.race.distanceMeters = 500;
        }
        return q(batchRecord);
    } else {
        const failure = 'Failed to create race. Record is missing length text';
        logger.log('info', failure);
        batchRecord.stepResults.push(failure);
        return q.reject(batchRecord);
    }
};

raceService.createRaceForBatch = function (batchRecord) {
    return raceService.create(batchRecord.race).then(() => {
        return q(batchRecord);
    });
};

raceService.createPlacingsForBatch = function (batchRecord) {
    if (batchRecord.record != null && batchRecord.record.placingObjects != null && batchRecord.record.placingObjects.length > 0) {
        const proms = batchRecord.record.placingObjects.map((placingObject) => {
            return raceService.createPlacingFromBatch(batchRecord.race, placingObject);
        });
        return q.allSettled(proms).then((results) => {
            let failures = results.filter((i) => {
                return i.state === 'rejected';
            });
            failures = failures.map((i) => {
                return `failed to create placing: ${i.reason}`;
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
        return q.reject('cant create placing without race');
    }
};

raceService.checkNameAndDateDoNotExist = function (model) {
    return raceService.find({ name: model.name, date: model.date }).then((results) => {
        if (results.length === 0) {
            return q(model);
        } else if (results.length === 1 && _.isEqual(results[0]._id, model._id)) {
            return q(model);
        } else {
            return q.reject('cannot have the same name and date as an existing race');
        }
    });
};

raceService.toExportFormat = function (raceRecord) {
    const exportRecord = {};
    exportRecord.name = raceRecord.name;
    exportRecord.date = moment(raceRecord.date).format('LLL');
    exportRecord.group = raceRecord.groupLevelName;
    exportRecord.length = raceRecord.distanceMeters;
    return exportRecord;
};
