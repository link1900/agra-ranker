var fileService = module.exports = {};

var q = require('q');
var _ = require('lodash');
var helper = require('../helper');
var mongoHelper = require('../mongoHelper');
var File = require('./file').model;
var mongoose = require('mongoose');
var grid = require('gridfs-stream');
var gfs = grid(mongoose.connection.db);

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