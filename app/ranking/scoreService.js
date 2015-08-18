var scoreService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var moment = require('moment');

var placingService = require('../placing/placingService');
var rankingService = require('./rankingService');
var RankingSystem = require('./rankingSystem').model;
var Ranking = require('./ranking').model;
var Score = require('./score').model;
var rankingSystemService = require('./rankingSystemService');
var baseService = require('../baseService');

baseService.addStandardServiceMethods(scoreService, Score);

scoreService.generateRankingsFromScores = function(rankingsFingerPrint, rankingSystem){
    var scoreCreationQueries = scoreService.getScoreCreationQueries(rankingSystem);
    return scoreService.createScores(rankingSystem, scoreCreationQueries, rankingsFingerPrint).then(function(){
        return scoreService.sumScoresIntoRankings(rankingSystem, rankingsFingerPrint).then(function(){
            return scoreService.removeAll({fingerPrint: rankingsFingerPrint});
        });
    });
};

scoreService.createScores = function(rankingSystem, pipelines, rankingsFingerPrint){
    var proms = pipelines.map(function(pipeline){
        return scoreService.createScore(rankingSystem, pipeline, rankingsFingerPrint);
    });
    return q.allSettled(proms).then(function(results){
        return results.filter(function(item){
            return item.state == 'fulfilled';
        }).map(function(i){return i.value;});
    });
};

scoreService.createScore = function(rankingSystem, pipeline, rankingsFingerPrint){
    return placingService.aggregate(pipeline).then(function(results){
        var proms = results.map(function(result){
            var score = new Score({
                fingerPrint : rankingsFingerPrint,
                rankingSystemRef : rankingSystem._id,
                ref: result.ref,
                name: result.name,
                points: result.points,
                placingRef: result.placingRef,
                position: result.position,
                raceName: result.raceName,
                raceRef: result.raceRef
            });
            return scoreService.create(score);
        });
        return q.allSettled(proms).then(function(results){
            return results.filter(function(item){
                return item.state == 'fulfilled';
            }).map(function(i){return i.value;});
        });
    });
};

scoreService.sumScoresIntoRankings = function(rankingSystem, rankingsFingerPrint){
    var pipeline = [
        {$match: {"fingerPrint": rankingsFingerPrint}},
        {$group:  { _id : {"ref":"$ref", "name":"$name"}, "totalPoints": { $sum: "$points" },
            "scores":{$push: {"points" : "$points", "placingRef":"$placingRef", "position" :"$position", "raceName":"$raceName", "raceRef":"$raceRef"}} }}
    ];

    return scoreService.aggregate(pipeline).then(function(results){
        var proms = results.map(function(result){
            var ranking = new Ranking({
                fingerPrint : rankingsFingerPrint,
                rankingSystemRef : rankingSystem._id,
                greyhoundRef: result._id.ref,
                greyhoundName: result._id.name,
                totalPoints : result.totalPoints,
                scores: result.scores
            });
            return rankingService.create(ranking);
        });
        return q.allSettled(proms).then(function(results){
            return results.filter(function(item){
                return item.state == 'fulfilled';
            }).map(function(i){return i.value;});
        });
    });
};

scoreService.getScoreCreationQueries = function(rankingSystem){
    return rankingSystem.pointAllotments.map(function(pointAllotment){
        return scoreService.getScoreCreationQuery(rankingSystem.groupBy, pointAllotment);
    });
};

scoreService.getScoreCreationQuery = function(groupBy, pointAllotment){
    var match = rankingSystemService.getQueryForPointAllotment(pointAllotment);
    var projection = {
        "race": "$race",
        "placing": "$placing",
        "name":"$"+groupBy.label,
        "ref": "$"+groupBy.field,
        "points":{$literal: pointAllotment.points},
        "placingRef":"$_id",
        "position" :"$placing",
        "raceRef" : "$raceRef",
        "raceName":"$race.name"
    };
    return [
        {$match: match},
        {$project: projection}
    ];
};

