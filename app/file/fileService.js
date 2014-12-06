var fileService = module.exports = {};

var q = require('q');
var _ = require('lodash');
var helper = require('../helper');
var mongoService = require('../mongoService');
var File = require('./file').model;
var mongoose = require('mongoose');
var grid = require('gridfs-stream');
var gfs = grid(mongoose.connection.db);
var csv = require('csv');

fileService.postUploadHandlers = {};

fileService.createPostUploadHandler = function(uploadType, handler){
    fileService.postUploadHandlers[uploadType] = handler;
};

fileService.processPostUpload = function(req, file, uploadType){
    if (_.contains(_.keys(fileService.postUploadHandlers), uploadType)){
        return fileService.postUploadHandlers[uploadType](req, file);
    } else {
        return q.reject("Upload of type '" + uploadType + "' is not a valid.");
    }
};

fileService.removeFile = function(id){
    var deferred = q.defer();
    gfs.remove({_id: id}, function (err) {
        if (err) {
            deferred.reject(err);
        }
        deferred.resolve(true);
    });
    return deferred.promise;
};


fileService.getFileReadStream = function(id){
    return gfs.createReadStream({_id: id});
};

fileService.createFileWriteStream = function(id, filename){
    return gfs.createWriteStream({
        _id : id,
        filename: filename
    });
};

fileService.streamCollectionToFile = function(dao, fileName, query, transformFunction){
    var deferred = q.defer();
    var dbStream = dao.find(query).stream();
    var transformer = csv.transform(transformFunction);
    var stringifier = csv.stringify();
    var fileId = mongoose.Types.ObjectId();
    var fileWriteStream = fileService.createFileWriteStream(fileId, fileName);

    dbStream.on('error', function (err) {
        deferred.reject(err);
    });

    transformer.on('error', function (err) {
        deferred.reject(err);
    });

    stringifier.on('error', function (err) {
        deferred.reject(err);
    });

    fileWriteStream.on('error', function (err) {
        deferred.reject(err);
    });

    fileWriteStream.on('close', function (err) {
        deferred.resolve({fileId: fileId});
    });

    dbStream.pipe(transformer).pipe(stringifier).pipe(fileWriteStream);
    return deferred.promise;
};