var greyhoundService = module.exports = {};

var q = require('q');
var _ = require('lodash');
var logger = require('winston');

var Greyhound = require('./greyhound').model;
var mongoService = require('../mongoService');
var baseService = require('../baseService');
var eventService = require('../event/eventService');

baseService.addStandardServiceMethods(greyhoundService, Greyhound);

greyhoundService.createGreyhoundFromJson = function(greyhoundJson){
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

greyhoundService.updateGreyhoundFromJson = function(existingModel, updatedGreyhoundJson){
    return greyhoundService.mergeWithExisting(existingModel,updatedGreyhoundJson)
        .then(greyhoundService.preProcessGreyhound)
        .then(greyhoundService.validateGreyhound)
        .then(greyhoundService.validateIfNameIsUsed)
        .then(greyhoundService.validateSireRef)
        .then(greyhoundService.validateDamRef)
        .then(greyhoundService.addSireNameFlyweight)
        .then(greyhoundService.addDamNameFlyweight)
        .then(greyhoundService.update);
};

greyhoundService.mergeWithExisting = function(existingModel, updatedBody){
    return q(_.extend(existingModel, updatedBody));
};

greyhoundService.greyhoundJsonToModel = function(json){
    return q(new Greyhound(json));
};

greyhoundService.preProcessGreyhound = function(greyhound){
    if (greyhound == null){
        return q.reject("greyhound requires a body");
    } else {
        if (greyhound.name != null){
            greyhound.name = greyhound.name.toUpperCase().trim();
        }

        return q(greyhound);
    }
};

greyhoundService.validateGreyhound = function(greyhound){
    if (greyhound.name == null){
        return q.reject("name field is required");
    }

    if (greyhound.name.length == 0){
        return q.reject("name cannot be blank");
    }

    var validGender = ["dog","bitch"];
    if (greyhound.gender && !_.includes(validGender,greyhound.gender)){
        return q.reject("greyhound gender was " + greyhound.gender + " and must be one of " + validGender);
    }

    return q(greyhound);
};

greyhoundService.validateGreyhoundIsNew = function(greyhound){
    return greyhoundService.findById(greyhound._id).then(function(result){
        if (result != null){
            return q.reject("greyhound with this id already exists");
        } else {
            return greyhoundService.validateIfNameIsUsed(greyhound);
        }
    });
};

greyhoundService.validateIfNameIsUsed = function(greyhound){
    return greyhoundService.findGreyhoundByName(greyhound.name).then(function(result){
        if (result != null &&
            result._id != null &&
            greyhound._id != null &&
            result._id.toString() != greyhound._id.toString()){
            return q.reject("greyhound already exists with this name");
        } else {
            return q(greyhound);
        }
    });
};

greyhoundService.validateSireRef = function(greyhound){
    if (greyhound.sireRef != null){
        if (!mongoService.isObjectId(greyhound.sireRef)) {
            return q.reject("invalid sire ref");
        }
        return greyhoundService.findById(greyhound.sireRef).then(function(sire){
            if (sire == null){
                return q.reject("could not find sire for sire ref");
            } else {
                if (sire._id.toString == greyhound._id.toString()){
                    return q.reject("cannot be own parent");
                } else {
                    if (greyhound.damRef != null){
                        return greyhoundService.findById(greyhound.damRef).then(function(dam){
                            if (sire._id.toString() == dam._id.toString()){
                                return q.reject("cannot have the same sire and dam");
                            } else {
                                return q(greyhound);
                            }
                        });
                    } else {
                        return q(greyhound);
                    }
                }
            }
        });
    } else {
        return q(greyhound);
    }
};

greyhoundService.validateDamRef = function(greyhound){
    if (greyhound.damRef != null){
        if (!mongoService.isObjectId(greyhound.damRef)) {
            return q.reject(`invalid dam ref ${greyhound.damRef}`);
        }
        return greyhoundService.findById(greyhound.damRef).then(function(dam){
            if (dam == null){
                return q.reject("could not find dam for dam ref");
            } else {
                if (dam._id.toString == greyhound._id.toString()){
                    return q.reject("cannot be own parent");
                } else {
                    if (greyhound.sireRef != null){
                        return greyhoundService.findById(greyhound.sireRef).then(function(sire){
                            if (sire._id.toString() == dam._id.toString()){
                                return q.reject("cannot have the same sire and dam");
                            } else {
                                return q(greyhound);
                            }
                        });
                    } else {
                        return q(greyhound);
                    }
                }
            }
        });
    } else {
        return q(greyhound);
    }
};

greyhoundService.rawCsvArrayToGreyhound = function(rawRow){
    var greyhound = {
        name : rawRow[0],
        sire: {name: rawRow[1]},
        dam: {name:rawRow[2]}
    };

    if (greyhound.name){
        greyhound.name = greyhound.name.toUpperCase().trim();
    }
    if (greyhound.sire.name){
        greyhound.sire.name = greyhound.sire.name.toUpperCase().trim();
    }
    if (greyhound.dam.name){
        greyhound.dam.name = greyhound.dam.name.toUpperCase().trim();
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

greyhoundService.findGreyhoundByName = function(name){
    return mongoService.findOne(Greyhound, {name: {$regex : "^"+name+"$", $options: "i"}});
};

greyhoundService.createGreyhoundByName = function(greyhoundName){
    return greyhoundService.findGreyhoundByName(greyhoundName).then(function(possibleGreyhound){
        if (possibleGreyhound != null){
            return {
                model : possibleGreyhound,
                details: "Found existing greyhound \"" + possibleGreyhound.name + "\" skipping greyhound creation"
            };
        } else {
            return greyhoundService.create(new Greyhound({name: greyhoundName})).then(function(saveResult){
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
        logger.log('error',creationFailure);
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
            logger.log('error', creationFailure);
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
        batchRecord.createdGreyhound.sireName = batchRecord.createdSire.name;
        return greyhoundService.update(batchRecord.createdGreyhound).then(function(updatedGreyhound){
            batchRecord.createdGreyhound = updatedGreyhound;
            batchRecord.stepResults.push("Updated \"" + updatedGreyhound.name + "\" to have sire \"" + batchRecord.createdSire.name + "\"");
            return batchRecord;
        }, function(updateSireError){
            logger.log('error',updateSireError);
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
            logger.log('error',creationFailure);
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
        batchRecord.createdGreyhound.damName = batchRecord.createdDam.name;
        return greyhoundService.update(batchRecord.createdGreyhound).then(function(updatedGreyhound){
            batchRecord.createdGreyhound = updatedGreyhound;
            batchRecord.stepResults.push("Updated \"" + updatedGreyhound.name + "\" to have dam \"" + batchRecord.createdDam.name + "\"");
            return batchRecord;
        }, function(updateSireError){
            logger.log('error',updateSireError);
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
            logger.log('error',"error importing greyhound csv", importError);
            return q({isSuccessful : false, stepResults: [JSON.stringify(importError)]});
        });
};

greyhoundService.newGreyhound = function(json){
    return new Greyhound(json);
};

greyhoundService.saveOrFindGreyhoundImportObject = function(greyhound){
    greyhound = greyhoundService.newGreyhound(greyhound);
    return greyhoundService.findExistingOld(greyhound).then(mongoService.savePromise);
};

greyhoundService.addSireNameFlyweight = function(greyhound){
    if (greyhound.sireRef != null){
        return mongoService.findOneById(Greyhound, greyhound.sireRef).then(function(found){
            greyhound.sireName = found.name;
            return greyhound;
        });
    } else {
        greyhound.sireName = null;
        return q(greyhound);
    }
};

greyhoundService.addDamNameFlyweight = function(greyhound){
    if (greyhound.damRef != null){
        return mongoService.findOneById(Greyhound, greyhound.damRef).then(function(found){
            greyhound.damName = found.name;
            return greyhound;
        });
    } else {
        greyhound.damName = null;
        return q(greyhound);
    }
};

greyhoundService.findExistingOld = function(greyhound) {
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

greyhoundService.greyhoundToExportFormat = function(greyhound){
    var exportFormat = {};
    exportFormat.name = greyhound.name;
    if (greyhound.sireName != null){
        exportFormat.sire = greyhound.sireName;
    }
    if (greyhound.damName != null){
        exportFormat.dam = greyhound.damName;
    }
    return exportFormat;
};

eventService.addListener("greyhound update listener","Updated Greyhound", function(event){
    if (event != null && event.data != null && event.data.entity != null && event.data.entity._id != null){
        return greyhoundService.find({ $or: [{sireRef: event.data.entity._id}, {damRef: event.data.entity._id}]}).then(function(results){
            var proms = results.map(function(greyhoundToUpdate){
                var updateRequired = false;
                if (greyhoundToUpdate.sireRef == event.data.entity._id.toString() &&
                    !_.isEqual(greyhoundToUpdate.sireName, event.data.entity.name)){
                    greyhoundToUpdate.sireName = event.data.entity.name;
                    updateRequired = true;
                }
                if (greyhoundToUpdate.damRef == event.data.entity._id.toString()
                    && !_.isEqual(greyhoundToUpdate.damName, event.data.entity.name)){
                    greyhoundToUpdate.damName = event.data.entity.name;
                    updateRequired = true;
                }

                if (updateRequired){
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

eventService.addListener("greyhound deleted listener","Deleted Greyhound", function(event){
    if (event != null && event.data != null && event.data.entity != null && event.data.entity._id != null){
        return greyhoundService.find({ $or: [{sireRef: event.data.entity._id}, {damRef: event.data.entity._id}]}).then(function(results){
            var proms = results.map(function(greyhoundToUpdate){
                if (greyhoundToUpdate.sireRef == event.data.entity._id.toString()){
                    greyhoundToUpdate.sireRef = null;
                    greyhoundToUpdate.sireName = null;
                }
                if (greyhoundToUpdate.damRef == event.data.entity._id.toString()){
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