'use strict';
var batchController = module.exports = {};

var mongoose = require('mongoose');
var BatchJob = mongoose.model('BatchJob');
var BatchResult = mongoose.model('BatchResult');
var Greyhound = mongoose.model('Greyhound');
var Busboy = require('busboy');
var _ = require('lodash');
var helper = require('../helper');
var q = require('q');
var constants = require('../constants');
var grid = require('gridfs-stream');
var gfs = grid(mongoose.connection.db);
var uuid = require('node-uuid');
var batchService = require('../services/batchService');

batchController.setBatch = function(req, res, next, id) {
    BatchJob.findById(id, function(err, model) {
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
    if (req.previousModel.status == constants.batchTypes.awaitingProcessing && req.model.status == constants.batchTypes.cancelled){
        return next();
    } else {
        return res.jsonp(400, {'error':'you are only allowed edit a batch by cancelling it'});
    }
};

batchController.createGreyhoundImportBatchFromFile = function(req, res){
    var storageId = uuid.v4();
    var fileWriteStream = gfs.createWriteStream({
        filename: storageId
    });

    fileWriteStream.on('error', function(gridfsError){
        console.log("error saving file to gridfs", gridfsError);
        res.jsonp(400, {'error':err});
    });

    fileWriteStream.on('close', function(file){
        batchController.createBatch(req.headers.uploadfilename, batchService.batchTypes.importGreyhoundCSV, {fileId : file._id}).then(function(batch){
            res.jsonp(200, batch);
        }, function(batchCreationError){
            console.log("batch creation error");
            res.jsonp(400, {'error':batchCreationError});
        });
    });

    var busboy = new Busboy({ headers: req.headers });

    busboy.on('file', function(fieldname, file, filename) {
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
        status: constants.batchTypes.awaitingProcessing
    });
    //then check the fields
    var error = batchController.hasError(batch);
    if (error){
        return q.reject(error);
    } else {
        return helper.savePromise(batch);
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