var fileController = module.exports = {};

var q = require('q');
var _ = require('lodash');

var File = require('./file').model;
var fileService = require('./fileService');
var helper = require('../helper');
var mongoHelper = require('../mongoHelper');
var Busboy = require('busboy');
var mongoose = require('mongoose');
var grid = require('gridfs-stream');
var gfs = grid(mongoose.connection.db);

fileController.setModel = function(req, res, next, id) {
    File.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load ' + id));
        req.model = model;
        return next();
    });
};

fileController.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var like = req.param('like');
    var name = req.param('name');
    if (like){
        req.searchQuery = {'filename': {'$regex': like.toLowerCase()}};
    }
    if (name){
        req.searchQuery = {'filename': name.toLowerCase()};
    }
    req.dao = File;
    next();
};

fileController.destroy = function(req, res) {
    helper.responseFromPromise(res, fileService.removeFile(req.model._id));
};

fileController.downloadFile = function(req, res){
    res.setHeader('Content-disposition', 'attachment; filename=' + req.model.filename);
    res.setHeader('Content-type', req.model.contentType);

    var filestream = fileService.getFileReadStream(req.model._id);
    filestream.pipe(res);
};

fileController.createPostUploadHandler = function(uploadType, handler){
    fileController.postUploadHandlers[uploadType] = handler;
};

fileController.postUploadHandlers = {};

var batchService = require('../batch/batchService');

fileController.createBatchHandler = function(req, file){
    return batchService.createBatch(req.headers.uploadfilename, req.param('batchType'), {fileId : file._id}).then(function(batch){
        return q(batch);
    }, function(batchCreationError){
        console.log("batch creation error");
        return q.reject({'error':batchCreationError});
    });
};

fileController.createPostUploadHandler('batch', fileController.createBatchHandler);

fileController.processPostUpload = function(req, file, uploadType){
    if (_.contains(_.keys(fileController.postUploadHandlers), uploadType)){
        return fileController.postUploadHandlers[uploadType](req, file);
    } else {
        return q.reject("Upload of type '" + uploadType + "' is not a valid.");
    }
};

fileController.uploadFile = function(req, res){
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
            helper.responseFromPromise(res, fileController.processPostUpload(req, file, req.uploadType));
        });

        file.pipe(fileWriteStream);
    });

    req.pipe(busboy);
};

fileController.setUploadType = function(req, res, next, type){
    req.uploadType = type;
    next();
};