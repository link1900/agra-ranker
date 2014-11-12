var adminService = module.exports = {};

var mongoose = require('mongoose');
var PointAllotment = mongoose.model('PointAllotment');
var Placing = mongoose.model('Placing');
var Ranking = mongoose.model('Ranking');
var User = mongoose.model('User');
var RankingSystem = mongoose.model('RankingSystem');
var Race = require('../race/race').model;
var GroupLevel = require('../groupLevel/groupLevel').model;
var Greyhound = require('../greyhound/greyhound').model;
var BatchJob = require('../batch/batchJob').model;
var BatchResult = require('../batch/batchResult').model;
var File = require('../batch/file').model;
var Chunk = require('../batch/file').chunkModel;
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

adminService.getAllCounts = function(){
    var proms = [
        mongoHelper.getCollectionCount(User).then(function(count){
            return {"user": count};
        }),
        mongoHelper.getCollectionCount(Greyhound).then(function(count){
            return {"greyhound": count};
        }),
        mongoHelper.getCollectionCount(Placing).then(function(count){
            return {"placing": count};
        }),
        mongoHelper.getCollectionCount(GroupLevel).then(function(count){
            return {"groupLevel": count};
        }),
        mongoHelper.getCollectionCount(Race).then(function(count){
            return {"race": count};
        }),
        mongoHelper.getCollectionCount(RankingSystem).then(function(count){
            return {"rankingSystem": count};
        }),
        mongoHelper.getCollectionCount(BatchResult).then(function(count){
            return {"batchJob": count};
        }),
        mongoHelper.getCollectionCount(BatchJob).then(function(count){
            return {"batchResult": count};
        }),
        mongoHelper.getCollectionCount(File).then(function(count){
            return {"file": count};
        }),
        mongoHelper.getCollectionStats(Chunk).then(function(stats){
            return {"fileSize":stats.size};
        })
    ];

    return q.allSettled(proms).then(function(results){
        var counts = results.map(function(promResult){return promResult.value;});
        return counts.reduce(function(previousValue, currentValue) {
            return _.merge(previousValue, currentValue);
        }, {});
    });
};