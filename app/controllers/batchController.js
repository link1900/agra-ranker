'use strict';
var batchController = module.exports = {};

var mongoose = require('mongoose');
var Batch = mongoose.model('Batch');
var Greyhound = mongoose.model('Greyhound');
var greyhoundController = require('./greyhoundController');
var BatchRecord = mongoose.model('BatchRecord');
var Busboy = require('busboy');
var csv = require('csv');
var _ = require('lodash');
var helper = require('../helper');
var q = require('q');
var constants = require('../constants');

batchController.setBatch = function(req, res, next, id) {
    Batch.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load batch ' + id));
        req.model = model;
        req.previousModel = _.clone(model.toObject());
        return next();
    });
};

batchController.prepareBatchQuery = function(req, res, next) {
    req.searchQuery = {};
    var like = req.param('like');
    var name = req.param('name');
    if (like){
        req.searchQuery = {'name': {'$regex': like.toLowerCase()}};
    }
    if (name){
        req.searchQuery = {'name': name.toLowerCase()};
    }
    req.dao = Batch;
    next();
};

batchController.getRecords = function(req, res, next) {
    req.searchQuery = {'batchRef': req.model._id };
    req.dao = BatchRecord;
    next();
};

batchController.checkFields = function(req, res, next){
    if (req.previousModel.status == constants.batchTypes.awaitingProcessing && req.model.status == constants.batchTypes.cancelled){
        helper.pushChangeToFk(BatchRecord, 'batchRef', req.model._id, req.model.status, 'status');
        return next();
    } else {
        return res.send(400, 'you are only allowed edit a batch by cancelling it');
    }
};

batchController.destroy = function(req, res) {
    //clean up references
    helper.killChildren(BatchRecord, 'batchRef', req.model._id, res);

    req.model.remove(function(err, removedModel) {
        if (err) {
            res.send(err.errors);
        } else {
            res.jsonp(removedModel);
        }
    });
};

batchController.createBatchFromFile = function(req, res){
    var busboy = new Busboy({ headers: req.headers });

    busboy.on('file', function(fieldname, file, filename) {
        batchController.createBatch(filename, fieldname, file, function(err, batch){
            if (err){
                file.resume();
                res.send(400, err.errors);
            } else {
                csv()
                    .from.stream(file)
                    .on('record', function(row,index){
                        batchController.createBatchRecord(batch, index+1, row, function(err){
                            if (err){
                                res.send(400, err);
                            }
                        });
                    })
                    .on('end', function(count){
                        res.send(200, batch);
                        console.log('Finishing parsing file ' + filename + ' with lines ' + count);
                    })
                    .on('error', function(error){
                        res.send(400,error);
                    });
            }
        });
    });

    req.pipe(busboy);
};

batchController.createBatch = function(name, type, recordStream, callback) {
    //generate the batch model
    var batch = new Batch({name:name, type:type, status: constants.batchTypes.awaitingProcessing});
    //then check the fields
    batch = batchController.cleanFields(batch);
    var error = batchController.hasError(batch);
    if (error){
        callback(error, batch);
    }
    //then parse the stream and generate the records

    //then save the batch and pass to call back
    batch.save(function(err, savedModel) {
        if (err) {
           callback(err, savedModel);
        } else {
           callback(null, savedModel);
        }
    });
};

batchController.createBatchRecord = function(batch, recordNumber, data, callback){
    var batchRecord = new BatchRecord({
        batchRef:batch._id,
        type:batch.type,
        recordNumber: recordNumber,
        status: constants.batchTypes.awaitingProcessing,
        rawData: data
    });
    batchRecord.save(function(err, savedModel) {
        if (err) {
            callback(err, savedModel);
        } else {
            callback(null, savedModel);
        }
    });
};

batchController.newBatchModel = function(json){
    return new Batch(json);
};

batchController.cleanFields = function(batch){
    if (batch.name){
        batch.name = batch.name.toLowerCase().trim();
    }
    if (batch.type){
        batch.type = batch.type.toLowerCase().trim();
    }
    return batch;
};

batchController.hasError = function(batch){
    var error;
    var nameValid = batch.name && batch.name.length > 0;
    var typeValid = batch.type && batch.type.length > 0;
    if (!nameValid){
        if (!error){
            error = {errors:[]};
        }
        error.message = 'invalid field';
        error.errors.push('name is required');
    }

    if (!typeValid){
        if (!error){
            error = {errors:[]};
        }
        error.message = 'invalid field';
        error.errors.push('type is required');
    }

    if (error){
        return error;
    } else {
        return null;
    }
};

//Main method for processing pending batches
//query for all pending batches and pass to process batch
batchController.processBatches = function(){
    //first query all batches that are waiting processing
    Batch.find({status: constants.batchTypes.awaitingProcessing}).exec(function(err, entities) {
        if (err) {
            console.log("error reading batch");
        } else {
            _.each(entities, function(entity){
                batchController.processBatch(entity);
            });
        }
    });
};

batchController.processSpecificBatch = function(req, res){
    batchController.processBatch(req.model);
    res.send(200, 'Started batch');
};

batchController.processBatch = function(batch){
    batchController.setToInProgress(batch)
        .then(batchController.processBatchRecords)
        .fail(function(err){
            console.log("had a batch error: " + err);
        });
};

batchController.setToInProgress = function(batch){
    batch.status = constants.batchTypes.inProgress;
    return helper.savePromise(batch);
};

batchController.processBatchRecords = function(batch){
    var query = BatchRecord.find({'batchRef': batch._id, 'status':constants.batchRecordTypes.awaitingProcessing });
    var batchRecordResultPromise = helper.findPromise(query).then(function(entities){
        var counters = {
            batch : batch,
            successCount: -1,
            failedCount : 0
        };

        var finalPromiseOfChain = _.reduce(entities, function(previousResult, currentValue) {
            return previousResult.then(function(){
                counters.successCount += 1;
                return batchController.processBatchRecord(currentValue);
            }).fail(function(){
                counters.failedCount += 1;
                return batchController.processBatchRecord(currentValue);
            });
        },
            q()
        );

        return finalPromiseOfChain.then(function(){
            return counters;
        }).fail(function(){return counters;});

    });

    //handle result
    return batchRecordResultPromise
        .then(batchController.saveBatchResult)
        .fail(batchController.saveBatchResult);
};

batchController.saveBatchResult = function(result){
    console.log("handle results " + result);
    if (result.failedCount > 0){
        result.batch.status = constants.batchTypes.completedWithFailures;
    } else {
        result.batch.status = constants.batchTypes.completed;
    }

    result.batch.successCount = result.successCount;
    result.batch.failureCount = result.failedCount;

    return helper.savePromise(result.batch);
};

//find out the batch type then get the correct handler for that type
batchController.processBatchRecord = function(batchRecord){
    return batchController.setToInProgress(batchRecord)
        .then(batchController.convertBatchRecord);
};

batchController.convertBatchRecord = function(batchRecord){
    var handler = batchController.getBatchRecordHandler(batchRecord.type);
    if (handler){
        return handler.process(batchRecord.rawData)
            .then(function(result){
                batchRecord.status = constants.batchRecordTypes.success;
                batchRecord.resultRef = result._id;
                return helper.savePromise(batchRecord);
            }).fail(function(err){
                console.log('failed to create entity: ' + err);
                batchRecord.status = constants.batchRecordTypes.failed;
                return helper.savePromise(batchRecord).then(function(){
                    var deferred = q.defer();
                    deferred.reject('failed to create entity: ' + err);
                    return deferred.promise;
                });
            });
    } else {
        console.log('error processing batch record of type ' + batchRecord.type + ' cannot find handler');
        batchRecord.status = constants.batchRecordTypes.failed;
        return helper.savePromise(batchRecord);
    }
};

batchController.getBatchRecordHandler = function(batchRecordType){
    if (batchRecordType = 'csvToGreyhound'){
        return batchController.csvToGreyhoundProvider();
    }
    console.log("cannot load handler for type " + batchRecordType);
    return null;
};

batchController.handlerFactory = function(rawToObject, persistObject){
    var handler = {};
    handler.rawToObject = rawToObject;
    handler.persistObject = persistObject;
    handler.process = function(raw){
        var object = handler.rawToObject(raw);
        return handler.persistObject(object);
    };
    return handler;
};

batchController.csvToGreyhoundProvider = function(){
    return batchController.handlerFactory(
        greyhoundController.rawCsvArrayToGreyhound,
        greyhoundController.processGreyhoundImportObject
    );
};
