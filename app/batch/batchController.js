'use strict';
var batchController = module.exports = {};

var mongoose = require('mongoose');
var BatchJob = require('./batchJob').model;
var BatchResult = require('./batchResult').model;
var Busboy = require('busboy');
var _ = require('lodash');
var helper = require('../helper');
var mongoHelper = require('../mongoHelper');
var q = require('q');
var grid = require('gridfs-stream');
var gfs = grid(mongoose.connection.db);
var batchService = require('./batchService');

batchController.setBatch = function(req, res, next, id) {
    BatchJob.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load batch ' + id));
        req.model = model;
        req.previousModel = _.clone(model.toObject());
        return next();
    });
};

batchController.setBatchResult = function(req, res, next, id) {
    BatchResult.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load batch result' + id));
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
    req.dao = BatchJob;
    next();
};

batchController.destroy = function(req, res) {
    //clean up batch records
    BatchResult.remove({'batchRef': req.model._id}, function(childErr){
        if (childErr != null){
            res.jsonp(400, {'error':childErr.errors});
        } else {
            req.model.remove(function(err, removedModel) {
                if (err) {
                    res.jsonp(400, {'error':err.errors});
                } else {
                    res.jsonp(200, removedModel);
                }
            });
        }
    });
};

batchController.checkFields = function(req, res, next){
    if (req.previousModel.status == batchService.batchStatuses.awaitingProcessing && req.model.status == batchService.batchStatuses.cancelled){
        return next();
    } else {
        return res.jsonp(400, {'error':'you are only allowed edit a batch by cancelling it'});
    }
};

batchController.setImportType = function(req, res, next, type){
    if (type == 'greyhound'){
        req.importType = batchService.batchTypes.importGreyhoundCSV;
    }
    if (type == 'race'){
        req.importType = batchService.batchTypes.importRaceCSV;
    }

    return next();
};

batchController.setImportFileType = function(req, res, next, fileType){
    req.importFileType = fileType;
    return next();
};

batchController.createBatchFromFile = function(req, res){
    var busboy = new Busboy({ headers: req.headers });

    busboy.on('file', function(fieldname, file, filename) {
        var fileWriteStream = gfs.createWriteStream({
            filename: filename
        });

        fileWriteStream.on('error', function(gridfsError){
            console.log("error saving file to gridfs", gridfsError);
            res.jsonp(400, {'error':err});
        });

        fileWriteStream.on('close', function(file){
            batchController.createBatch(req.headers.uploadfilename, req.importType, {fileId : file._id}).then(function(batch){
                res.jsonp(200, batch);
            }, function(batchCreationError){
                console.log("batch creation error");
                res.jsonp(400, {'error':batchCreationError});
            });
        });

        file.pipe(fileWriteStream);
    });

    req.pipe(busboy);
};

batchController.createBatch = function(name, type, metadata) {
    //generate the batch model
    var batch = new BatchJob({
        name:name,
        type:type,
        metadata: metadata,
        status: batchService.batchStatuses.awaitingProcessing
    });
    //then check the fields
    var error = batchController.hasError(batch);
    if (error){
        return q.reject(error);
    } else {
        return mongoHelper.savePromise(batch);
    }
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

batchController.totalForBatch = function(req, res){
    var pipeline =[
        {$match : {batchRef: req.model._id}},
        {
            $project : {
                duration : {$subtract :["$endDate","$startDate"]},
                success : {$cond: { if: {$eq : ["$status","Success"]}, then: 1, else: 0 }},
                failure : {$cond: { if: {$eq : ["$status","Failed"]}, then: 1, else: 0 }}
            }
        },
        {$group: { '_id': {'batchRef' : "$batchRef"}, 'totalDuration' : { '$sum' : "$duration" }, totalSuccess : { '$sum' : "$success" }, totalFailure : { '$sum' : "$failure" }}}
    ];
    helper.responseFromPromise(res,  mongoHelper.aggregateSinglePromise(BatchResult, pipeline));
};