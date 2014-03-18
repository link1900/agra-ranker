'use strict';
var batchRecordController = module.exports = {};

var mongoose = require('mongoose');
var BatchRecord = mongoose.model('BatchRecord');


batchRecordController.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var like = req.param('like');
    var batchRef = req.param('batchRef');
    if (like){
        req.searchQuery.rawData = {'$regex': new RegExp(like, "i")};
    }
    if (batchRef){
        req.searchQuery.batchRef = batchRef;
    }
    req.dao = BatchRecord;
    next();
};