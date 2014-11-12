var fileController = module.exports = {};

var q = require('q');
var _ = require('lodash');

var File = require('./file').model;
var fileService = require('./fileService');
var helper = require('../helper');
var mongoHelper = require('../mongoHelper');

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