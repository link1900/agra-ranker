var adminService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');

var raceService = require('../race/raceService');
var greyhoundService = require('../greyhound/greyhoundService');
var placingService = require('../placing/placingService');
var Ranking = mongoose.model('Ranking');
var Score = mongoose.model('Score');
var User = require('../user/user').model;
var RankingSystem = mongoose.model('RankingSystem');
var GroupLevel = require('../groupLevel/groupLevel').model;
var BatchJob = require('../batch/batchJob').model;
var BatchResult = require('../batch/batchResult').model;
var Invite = require('../invite/invite').model;
var File = require('../file/file').model;
var Chunk = require('../file/file').chunkModel;
var Setting = require('../setting/setting').model;
var mongoService = require('../mongoService');

adminService.removeAllGreyhounds = function(){
    return placingService.removeAll({}).then(function(){
        return greyhoundService.removeAll({});
    });
};

adminService.removeAllRaces = function(){
    return placingService.removeAll({}).then(function(){
        return raceService.removeAll({});
    });
};

adminService.removeAllBatchJobs = function(){
    return mongoService.dropCollection(BatchResult).then(function(){
        return mongoService.dropCollection(BatchJob);
    });
};

adminService.removeAllRankingSystems = function(){
    return mongoService.dropCollection(Ranking).then(function(){
        return mongoService.dropCollection(RankingSystem);
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

adminService.removeAllRankings = function(){
    return mongoService.dropCollection(Score).then(function(){
        return mongoService.dropCollection(Ranking);
    });
};

adminService.setupGroupLevel = function(){
    return mongoService.saveAll([
        new GroupLevel({name:"Group 1"}),
        new GroupLevel({name:"Group 2"}),
        new GroupLevel({name:"Group 3"})
    ]);
};

adminService.setupSireRankingSystem = function(){
    //sire
    var sireRanking = {
        name: "Sire",
        description: "Sire based rankings",
        equalPositionResolution: "splitPoints",
        groupBy:{
            label: "greyhound.sireName",
            field: "greyhound.sireRef"
        },
        pointAllotments:[],
        commonCriteria: [
            {field: "race.disqualified", "comparator": "=", "value": false, type: "Boolean"},
            {field: "greyhound.sireRef", "comparator": "exists", "value": true, type: "Boolean"}
        ]
    };

    //sprint group
    var group1Sire = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 1", type: "Text"}];
    var group2Sire = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 2", type: "Text"}];
    var group3Sire = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 3", type: "Text"}];
    sireRanking.pointAllotments = sireRanking.pointAllotments
        .concat(adminService.generateAllotmentSet([70, 35, 20, 15, 10, 8, 7, 6], group1Sire))
        .concat(adminService.generateAllotmentSet([40, 25, 15, 10, 8, 7, 6, 5], group2Sire))
        .concat(adminService.generateAllotmentSet([25, 16, 12, 8, 6, 5, 4, 3], group3Sire));

    return mongoService.saveAll([new RankingSystem(sireRanking)]);
};

adminService.setupDamRankingSystem = function(){
    //dam
    var damRanking = {
        name: "Dam",
        description: "Dam based rankings",
        equalPositionResolution: "splitPoints",
        groupBy:{
            label: "greyhound.damName",
            field: "greyhound.damRef"
        },
        pointAllotments:[],
        commonCriteria: [
            {field: "race.disqualified", "comparator": "=", "value": false, type: "Boolean"},
            {field: "greyhound.damRef", "comparator": "exists", "value": true, type: "Boolean"}
        ]
    };

    //dam group
    var group1Dam = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 1", type: "Text"}];
    var group2Dam = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 2", type: "Text"}];
    var group3Dam = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 3", type: "Text"}];
    damRanking.pointAllotments = damRanking.pointAllotments
        .concat(adminService.generateAllotmentSet([6, 4, 3, 1, 1, 1, 1, 1], group1Dam))
        .concat(adminService.generateAllotmentSet([4, 3, 2, 1, 1, 1, 1, 1], group2Dam))
        .concat(adminService.generateAllotmentSet([4, 3, 2, 1, 1, 1, 1, 1], group3Dam));
    return mongoService.saveAll([new RankingSystem(damRanking)]);
};

adminService.setupDefaultRankingSystem = function(){
    var agraRanker = {
        name: "Greyhounds",
        description: "The main ranking system for agra",
        equalPositionResolution: "splitPoints",
        groupBy:{
            label: "greyhound.name",
            field: "greyhoundRef"
        },
        pointAllotments:[],
        commonCriteria: [
            {field: "race.disqualified", "comparator": "=", "value": false, type: "Boolean"}
        ]
    };

    //sprint group
    var baseSprint = [{field: "race.distanceMeters", "comparator": "<", "value": 595, type: "Number"}];
    var group1Sprint = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 1", type: "Text"}].concat(baseSprint);
    var group2Sprint = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 2", type: "Text"}].concat(baseSprint);
    var group3Sprint = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 3", type: "Text"}].concat(baseSprint);
    agraRanker.pointAllotments = agraRanker.pointAllotments
        .concat(adminService.generateAllotmentSet([70, 35, 20, 15, 10, 8, 7, 6], group1Sprint))
        .concat(adminService.generateAllotmentSet([40, 25, 15, 10, 8, 7, 6, 5], group2Sprint))
        .concat(adminService.generateAllotmentSet([25, 16, 12, 8, 6, 5, 4, 3], group3Sprint));

    //stay groups
    var baseStay = [{field: "race.distanceMeters", "comparator": ">=", "value": 595, type: "Number"}];
    var group1Stay = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 1", type: "Text"}].concat(baseStay);
    var group2Stay = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 2", type: "Text"}].concat(baseStay);
    var group3Stay = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 3", type: "Text"}].concat(baseStay);
    agraRanker.pointAllotments = agraRanker.pointAllotments
        .concat(adminService.generateAllotmentSet([50, 25, 16, 12, 8, 6, 4, 2], group1Stay))
        .concat(adminService.generateAllotmentSet([30, 20, 12, 8, 6, 4, 2, 1], group2Stay))
        .concat(adminService.generateAllotmentSet([20, 14, 10, 6, 4, 3, 2, 1], group3Stay));

    return mongoService.saveAll([new RankingSystem(agraRanker)]);
};

adminService.setupRankingSystemDefaults = function(){
    return adminService.removeAllRankingSystems()
        .then(adminService.setupDefaultRankingSystem)
        .then(adminService.setupSireRankingSystem)
        .then(adminService.setupDamRankingSystem)
        .then(function(){
        return adminService.setupDefaultSettings();
    });
};

adminService.setupDefaultSettings = function(){
    var settings ={settingType : "system"};

    return mongoService.findOne(RankingSystem, {name: "Greyhounds"}).then(function(one){
        if (one != null && one._id != null){
            settings.defaultRankingSystem = one._id.toString();
            return mongoService.dropCollection(Setting).then(function() {
                return mongoService.saveAll([new Setting(settings)]);
            });
        } else {
            return q();
        }
    });
};

adminService.generateAllotmentSet = function(pointArray, defaultCriteria){
    return pointArray.map(function(pointValue, index){
        var newCriteria = defaultCriteria.slice();
        newCriteria.push({field: "placing", "comparator": "=", "value": (index+1).toString(), type: "Text"});
        return {
            points: pointValue,
            criteria:newCriteria
        };
    })
};

adminService.getAllCounts = function(){
    var proms = [
        mongoService.getCollectionCount(User).then(function(count){
            return {"user": count};
        }),
        greyhoundService.count().then(function(count){
            return {"greyhound": count};
        }),
        placingService.count().then(function(count){
            return {"placing": count};
        }),
        mongoService.getCollectionCount(GroupLevel).then(function(count){
            return {"groupLevel": count};
        }),
        raceService.count().then(function(count){
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