'use strict';
var batchController = module.exports = {};

var mongoose = require('mongoose');
var Batch = mongoose.model('Batch');
var BatchRecord = mongoose.model('BatchRecord');
var Busboy = require('busboy');
var csv = require('csv');
var Transform = require('stream').Transform;

batchController.getOne = function(req, res) {
    res.jsonp(req.batch);
};

batchController.setBatch = function(req, res, next, id) {
    Batch.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load batch ' + id));
        req.batch = model;
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
    req.searchQuery = {'batchRef': req.batch._id };
    req.dao = BatchRecord;
    next();
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

//    busboy.on('finish', function() {
//        res.send(200,'finished reading file');
//    });

    req.pipe(busboy);
};

batchController.createBatch = function(name, type, recordStream, callback) {
    //generate the batch model
    var batch = new Batch({name:name, type:type, status: "Awaiting processing"});
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
        status: "Awaiting processing",
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