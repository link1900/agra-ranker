var batchResultController = module.exports = {};

var mongoose = require('mongoose');
var BatchResult = mongoose.model('BatchResult');


batchResultController.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var like = req.param('like');
    var batchRef = req.param('batchRef');
    if (like){
        req.searchQuery.rawData = {'$regex': new RegExp(like, "i")};
    }
    if (batchRef){
        req.searchQuery.batchRef = batchRef;
    }
    req.dao = BatchResult;
    next();
};