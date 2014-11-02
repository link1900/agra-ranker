var adminService = module.exports = {};

var mongoose = require('mongoose');
var PointAllotment = mongoose.model('PointAllotment');
var Placing = mongoose.model('Placing');
var Ranking = mongoose.model('Ranking');
var Race = require('../race/race').model;
var Greyhound = require('../greyhound/greyhound').model;
var BatchJob = require('../batch/batchJob').model;
var BatchResult = require('../batch/batchResult').model;
var _ = require('lodash');
var helper = require('../helper');
var mongoHelper = require('../mongoHelper');
var Schema = mongoose.Schema;
var q = require('q');

adminService.removeAllGreyhounds = function(){
    return mongoHelper.dropCollection(Placing).then(function(){
        return mongoHelper.dropCollection(Greyhound);
    });
};

adminService.removeAllBatchJobs = function(){
    return mongoHelper.dropCollection(BatchResult).then(function(){
        return mongoHelper.dropCollection(BatchJob);
    });
};