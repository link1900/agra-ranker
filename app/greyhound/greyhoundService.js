const greyhoundService = module.exports = {};

const q = require('q');
const _ = require('lodash');
const logger = require('winston');

const Greyhound = require('./greyhound').model;
const mongoService = require('../mongoService');
const baseService = require('../baseService');
const eventService = require('../event/eventService');

baseService.addStandardServiceMethods(greyhoundService, Greyhound);

greyhoundService.createGreyhoundFromJson = function (greyhoundJson) {
    return greyhoundService.greyhoundJsonToModel(greyhoundJson)
        .then(greyhoundService.preProcessGreyhound)
        .then(greyhoundService.validateGreyhound)
        .then(greyhoundService.validateGreyhoundIsNew)
        .then(greyhoundService.validateSireRef)
        .then(greyhoundService.validateDamRef)
        .then(greyhoundService.addSireNameFlyweight)
        .then(greyhoundService.addDamNameFlyweight)
        .then(greyhoundService.create);
};

greyhoundService.updateGreyhoundFromJson = function (existingModel, updatedGreyhoundJson) {
    return greyhoundService.mergeWithExisting(existingModel, updatedGreyhoundJson)
        .then(greyhoundService.preProcessGreyhound)
        .then(greyhoundService.validateGreyhound)
        .then(greyhoundService.validateIfNameIsUsed)
        .then(greyhoundService.validateSireRef)
        .then(greyhoundService.validateDamRef)
        .then(greyhoundService.addSireNameFlyweight)
        .then(greyhoundService.addDamNameFlyweight)
        .then(greyhoundService.update);
};

greyhoundService.mergeWithExisting = function (existingModel, updatedBody) {
    return q(_.extend(existingModel, updatedBody));
};

greyhoundService.greyhoundJsonToModel = function (json) {
    return q(new Greyhound(json));
};

greyhoundService.preProcessGreyhound = function (greyhound) {
    if (greyhound == null) {
        return q.reject('greyhound requires a body');
    } else {
        if (greyhound.name != null) {
            greyhound.name = greyhound.name.toUpperCase().trim();
        }

        return q(greyhound);
    }
};

greyhoundService.validateGreyhound = function (greyhound) {
    if (greyhound.name == null) {
        return q.reject('name field is required');
    }

    if (greyhound.name.length === 0) {
        return q.reject('name cannot be blank');
    }

    const validGender = ['dog', 'bitch'];
    if (greyhound.gender && !_.includes(validGender, greyhound.gender)) {
        return q.reject(`greyhound gender was ${greyhound.gender} and must be one of ${validGender}`);
    }

    return q(greyhound);
};

greyhoundService.validateGreyhoundIsNew = function (greyhound) {
    return greyhoundService.findById(greyhound._id).then((result) => {
        if (result) {
            return q.reject('greyhound with this id already exists');
        } else {
            return greyhoundService.validateIfNameIsUsed(greyhound);
        }
    });
};

greyhoundService.validateIfNameIsUsed = function (greyhound) {
    return greyhoundService.findGreyhoundByName(greyhound.name).then((result) => {
        if (result &&
            result._id &&
            greyhound._id &&
            result._id.toString() !== greyhound._id.toString()) {
            return q.reject('greyhound already exists with this name');
        } else {
            return q(greyhound);
        }
    });
};

greyhoundService.validateSireRef = function (greyhound) {
    if (!greyhound.sireRef) {
        return q(greyhound);
    }

    if (!mongoService.isObjectId(greyhound.sireRef)) {
        return q.reject('invalid sire ref');
    }

    return greyhoundService.findById(greyhound.sireRef).then((sire) => {
        if (!sire) {
            return q.reject('could not find sire for sire ref');
        }
        if (sire._id.toString() === greyhound._id.toString()) {
            return q.reject('cannot be own parent');
        }

        if (greyhound.damRef) {
            if (sire._id.toString() === greyhound.damRef.toString()) {
                return q.reject('cannot have the same sire and dam');
            }
        }

        return q(greyhound);
    });
};

greyhoundService.validateDamRef = function (greyhound) {
    if (greyhound.damRef) {
        if (!mongoService.isObjectId(greyhound.damRef)) {
            return q.reject(`invalid dam ref ${greyhound.damRef}`);
        }
        return greyhoundService.findById(greyhound.damRef).then((dam) => {
            if (!dam) {
                return q.reject('could not find dam for dam ref');
            } else if (dam._id.toString() === greyhound._id.toString()) {
                return q.reject('cannot be own parent');
            } else if (greyhound.sireRef) {
                return greyhoundService.findById(greyhound.sireRef).then((sire) => {
                    if (sire._id.toString() === dam._id.toString()) {
                        return q.reject('cannot have the same sire and dam');
                    } else {
                        return q(greyhound);
                    }
                });
            } else {
                return q(greyhound);
            }
        });
    } else {
        return q(greyhound);
    }
};

greyhoundService.rawCsvArrayToGreyhound = function (rawRow) {
    const greyhound = {
        name: rawRow[0],
        sire: { name: rawRow[1] },
        dam: { name: rawRow[2] }
    };

    if (greyhound.name) {
        greyhound.name = greyhound.name.toUpperCase().trim();
    }
    if (greyhound.sire.name) {
        greyhound.sire.name = greyhound.sire.name.toUpperCase().trim();
    }
    if (greyhound.dam.name) {
        greyhound.dam.name = greyhound.dam.name.toUpperCase().trim();
    }

    // check fields
    if (greyhound.name.length === 0) {
        return null;
    }
    if (greyhound.sire.name.length === 0) {
        delete greyhound.sire;
    }
    if (greyhound.dam.name.length === 0) {
        delete greyhound.dam;
    }
    return greyhound;
};

greyhoundService.findGreyhoundByName = function (name) {
    return mongoService.findOne(Greyhound, { name: { $regex: `^${name}$`, $options: 'i' } });
};

greyhoundService.createGreyhoundByName = function (greyhoundName) {
    return greyhoundService.findGreyhoundByName(greyhoundName).then((possibleGreyhound) => {
        if (possibleGreyhound) {
            return {
                model: possibleGreyhound,
                details: `Found existing greyhound "${possibleGreyhound.name}" skipping greyhound creation`
            };
        } else {
            return greyhoundService.create(new Greyhound({ name: greyhoundName })).then((saveResult) => {
                return {
                    model: saveResult,
                    details: `Created greyhound "${saveResult.name}"`
                };
            });
        }
    });
};

greyhoundService.createStep = function (batchRecord) {
    return greyhoundService.createGreyhoundByName(batchRecord.greyhoundRecord.name).then((greyhoundImportResult) => {
        batchRecord.createdGreyhound = greyhoundImportResult.model;
        batchRecord.stepResults.push(greyhoundImportResult.details);
        return batchRecord;
    }, (creationFailure) => {
        logger.log('error', creationFailure);
        batchRecord.stepResults.push(`Failed to create greyhound "${batchRecord.greyhoundRecord.name}" error:${creationFailure}`);
        return q.reject(batchRecord);
    });
};

greyhoundService.createSireStep = function (batchRecord) {
    if (batchRecord.greyhoundRecord.sire && batchRecord.createdGreyhound) {
        return greyhoundService.createGreyhoundByName(batchRecord.greyhoundRecord.sire.name).then((sireImportResult) => {
            batchRecord.createdSire = sireImportResult.model;
            batchRecord.stepResults.push(sireImportResult.details);
            return batchRecord;
        }, (creationFailure) => {
            logger.log('error', creationFailure);
            batchRecord.stepResults.push(`Failed to create sire greyhound "${batchRecord.greyhoundRecord.name}" error:${creationFailure}`);
            return q.reject(batchRecord);
        });
    } else {
        return q(batchRecord);
    }
};

greyhoundService.setSireStep = function (batchRecord) {
    if (batchRecord.createdSire && batchRecord.createdGreyhound) {
        batchRecord.createdGreyhound.sireRef = batchRecord.createdSire._id;
        batchRecord.createdGreyhound.sireName = batchRecord.createdSire.name;
        return greyhoundService.update(batchRecord.createdGreyhound).then((updatedGreyhound) => {
            batchRecord.createdGreyhound = updatedGreyhound;
            batchRecord.stepResults.push(`Updated "${updatedGreyhound.name}" to have sire "${batchRecord.createdSire.name}"`);
            return batchRecord;
        }, (updateSireError) => {
            logger.log('error', updateSireError);
            batchRecord.stepResults.push(`Failed to update sire for "${batchRecord.createdGreyhound.name}" error:${updateSireError}`);
            return q.reject(batchRecord);
        });
    } else {
        return q(batchRecord);
    }
};

greyhoundService.createDamStep = function (batchRecord) {
    if (batchRecord.greyhoundRecord.dam && batchRecord.createdGreyhound) {
        return greyhoundService.createGreyhoundByName(batchRecord.greyhoundRecord.dam.name).then((damImportResult) => {
            batchRecord.createdDam = damImportResult.model;
            batchRecord.stepResults.push(damImportResult.details);
            return batchRecord;
        }, (creationFailure) => {
            logger.log('error', creationFailure);
            batchRecord.stepResults.push(`Failed to create dam greyhound "${batchRecord.greyhoundRecord.name}" error:${creationFailure}`);
            return q.reject(batchRecord);
        });
    } else {
        return q(batchRecord);
    }
};

greyhoundService.setDamStep = function (batchRecord) {
    if (batchRecord.createdDam && batchRecord.createdGreyhound) {
        batchRecord.createdGreyhound.damRef = batchRecord.createdDam._id;
        batchRecord.createdGreyhound.damName = batchRecord.createdDam.name;
        return greyhoundService.update(batchRecord.createdGreyhound).then((updatedGreyhound) => {
            batchRecord.createdGreyhound = updatedGreyhound;
            batchRecord.stepResults.push(`Updated "${updatedGreyhound.name}" to have dam "${batchRecord.createdDam.name}"`);
            return batchRecord;
        }, (updateSireError) => {
            logger.log('error', updateSireError);
            batchRecord.stepResults.push(`Failed to update dam for "${batchRecord.createdGreyhound.name}" error:${updateSireError}`);
            return q.reject(batchRecord);
        });
    } else {
        return q(batchRecord);
    }
};

greyhoundService.processGreyhoundRow = function (record) {
    const batchRecord = { stepResults: [], greyhoundRecord: greyhoundService.rawCsvArrayToGreyhound(record) };
    return greyhoundService.createStep(batchRecord)
        .then(greyhoundService.createSireStep)
        .then(greyhoundService.setSireStep)
        .then(greyhoundService.createDamStep)
        .then(greyhoundService.setDamStep)
        .then((finalBatchRecord) => {
            return { isSuccessful: true, stepResults: finalBatchRecord.stepResults };
        }).fail((importError) => {
            logger.log('error', 'error importing greyhound csv', importError);
            return q({ isSuccessful: false, stepResults: [JSON.stringify(importError)] });
        });
};

greyhoundService.newGreyhound = function (json) {
    return new Greyhound(json);
};

greyhoundService.saveOrFindGreyhoundImportObject = function (greyhound) {
    greyhound = greyhoundService.newGreyhound(greyhound);
    return greyhoundService.findExistingOld(greyhound).then(mongoService.savePromise);
};

greyhoundService.addSireNameFlyweight = function (greyhound) {
    if (greyhound.sireRef) {
        return mongoService.findOneById(Greyhound, greyhound.sireRef).then((found) => {
            greyhound.sireName = found.name;
            return greyhound;
        });
    } else {
        greyhound.sireName = null;
        return q(greyhound);
    }
};

greyhoundService.addDamNameFlyweight = function (greyhound) {
    if (greyhound.damRef) {
        return mongoService.findOneById(Greyhound, greyhound.damRef).then((found) => {
            greyhound.damName = found.name;
            return greyhound;
        });
    } else {
        greyhound.damName = null;
        return q(greyhound);
    }
};

greyhoundService.findExistingOld = function (greyhound) {
    const deferred = q.defer();
    Greyhound.findOne({ name: greyhound.name }, (err, existingGreyhound) => {
        if (err) {
            deferred.reject(`error checking greyhound name ${greyhound.name}`);
        }
        if (existingGreyhound) {
            deferred.resolve(existingGreyhound);
        }
        deferred.resolve(greyhound);
    });
    return deferred.promise;
};

greyhoundService.greyhoundToExportFormat = function (greyhound) {
    const exportFormat = {};
    exportFormat.name = greyhound.name;
    if (greyhound.sireName) {
        exportFormat.sire = greyhound.sireName;
    }
    if (greyhound.damName) {
        exportFormat.dam = greyhound.damName;
    }
    return exportFormat;
};

eventService.addListener('greyhound update listener', 'Updated Greyhound', (event) => {
    if (event && event.data && event.data.entity && event.data.entity._id) {
        return greyhoundService.find({ $or: [{ sireRef: event.data.entity._id }, { damRef: event.data.entity._id }] }).then((results) => {
            const proms = results.map((greyhoundToUpdate) => {
                let updateRequired = false;
                if (greyhoundToUpdate.sireRef.toString() === event.data.entity._id.toString() &&
                    !_.isEqual(greyhoundToUpdate.sireName, event.data.entity.name)) {
                    greyhoundToUpdate.sireName = event.data.entity.name;
                    updateRequired = true;
                }
                if (greyhoundToUpdate.damRef.toString() === event.data.entity._id.toString()
                    && !_.isEqual(greyhoundToUpdate.damName, event.data.entity.name)) {
                    greyhoundToUpdate.damName = event.data.entity.name;
                    updateRequired = true;
                }

                if (updateRequired) {
                    return greyhoundService.update(greyhoundToUpdate);
                } else {
                    return q(greyhoundToUpdate);
                }
            });
            return q.all(proms);
        });
    } else {
        return q();
    }
});

eventService.addListener('greyhound deleted listener', 'Deleted Greyhound', (event) => {
    if (event && event.data && event.data.entity && event.data.entity._id) {
        return greyhoundService.find({ $or: [{ sireRef: event.data.entity._id }, { damRef: event.data.entity._id }] }).then((results) => {
            const proms = results.map((greyhoundToUpdate) => {
                if (greyhoundToUpdate.sireRef.toString() === event.data.entity._id.toString()) {
                    greyhoundToUpdate.sireRef = null;
                    greyhoundToUpdate.sireName = null;
                }
                if (greyhoundToUpdate.damRef.toString() === event.data.entity._id.toString()) {
                    greyhoundToUpdate.damRef = null;
                    greyhoundToUpdate.damName = null;
                }

                return greyhoundService.update(greyhoundToUpdate);
            });
            return q.all(proms);
        });
    } else {
        return q();
    }
});
