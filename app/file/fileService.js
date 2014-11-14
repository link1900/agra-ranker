var fileService = module.exports = {};

var q = require('q');
var _ = require('lodash');
var helper = require('../helper');
var mongoHelper = require('../mongoHelper');
var File = require('./file').model;
var mongoose = require('mongoose');
var grid = require('gridfs-stream');
var gfs = grid(mongoose.connection.db);

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