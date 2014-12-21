var adminService = module.exports = {};

var mongoose = require('mongoose');
var PointAllotment = mongoose.model('PointAllotment');
var Placing = require('../placing/placing').model;
var Ranking = mongoose.model('Ranking');
var User = require('../user/user').model;
var RankingSystem = mongoose.model('RankingSystem');
var Race = require('../race/race').model;
var GroupLevel = require('../groupLevel/groupLevel').model;
var Greyhound = require('../greyhound/greyhound').model;
var BatchJob = require('../batch/batchJob').model;
var BatchResult = require('../batch/batchResult').model;
var Invite = require('../invite/invite').model;
var File = require('../file/file').model;
var Chunk = require('../file/file').chunkModel;
var _ = require('lodash');
var helper = require('../helper');
var mongoService = require('../mongoService');
var Schema = mongoose.Schema;
var q = require('q');

adminService.removeAllGreyhounds = function(){
    return mongoService.dropCollection(Placing).then(function(){
        return mongoService.dropCollection(Greyhound);
    });
};

adminService.removeAllRaces = function(){
    return mongoService.dropCollection(Placing).then(function(){
        return mongoService.dropCollection(Race);
    });
};

adminService.removeAllBatchJobs = function(){
    return mongoService.dropCollection(BatchResult).then(function(){
        return mongoService.dropCollection(BatchJob);
    });
};

adminService.removeAllFiles = function(){
    return mongoService.dropCollection(Chunk).then(function(){
        return mongoService.dropCollection(File);
    });
};

adminService.removeAllGroupLevels = function(){
    return mongoService.dropCollection(GroupLevel);
};

adminService.setupGroupLevel = function(){
    return mongoService.saveAll([
        new GroupLevel({name:"Group 1"}),
        new GroupLevel({name:"Group 2"}),
        new GroupLevel({name:"Group 3"})
    ]);
};

adminService.getAllCounts = function(){
    var proms = [
        mongoService.getCollectionCount(User).then(function(count){
            return {"user": count};
        }),
        mongoService.getCollectionCount(Greyhound).then(function(count){
            return {"greyhound": count};
        }),
        mongoService.getCollectionCount(Placing).then(function(count){
            return {"placing": count};
        }),
        mongoService.getCollectionCount(GroupLevel).then(function(count){
            return {"groupLevel": count};
        }),
        mongoService.getCollectionCount(Race).then(function(count){
            return {"race": count};
        }),
        mongoService.getCollectionCount(Invite).then(function(count){
            return {"invite": count};
        }),
        mongoService.getCollectionCount(RankingSystem).then(function(count){
            return {"rankingSystem": count};
        }),
        mongoService.getCollectionCount(BatchResult).then(function(count){
            return {"batchJob": count};
        }),
        mongoService.getCollectionCount(BatchJob).then(function(count){
            return {"batchResult": count};
        }),
        mongoService.getCollectionCount(File).then(function(count){
            return {"file": count};
        }),
        mongoService.getCollectionStats(Chunk).then(function(stats){
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