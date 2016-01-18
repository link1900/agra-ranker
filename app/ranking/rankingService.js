var rankingService = module.exports = {};

var _ = require('lodash');
var q = require('q');

var placingService = require('../placing/placingService');
var mongoService = require('../mongoService');
var RankingSystem = require('./rankingSystem').model;
var Ranking = require('./ranking').model;
var scoreService = require('./scoreService');
var baseService = require('../baseService');
var Setting = require('../setting/setting').model;

baseService.addStandardServiceMethods(rankingService, Ranking);

/**
 * Main method for creating the rankings. Will not create rankings if a valid ranking set already exists.
 */
rankingService.createRankingsIfRequired = function(periodStart, periodEnd, rankingSystemRef){
    //get complete ranking system
    return rankingService.getCompleteRankingSystem(periodStart, periodEnd, rankingSystemRef).then(function(rankingSystem){
        //get ranking finger print
        return rankingService.getRankingsFingerPrint(periodStart, periodEnd, rankingSystem).then(function(rankingsFingerPrint){
            return rankingService.distinctField("fingerPrint", {"fingerPrint": rankingsFingerPrint}).then(function(fingerPrints){
                if (fingerPrints != null && fingerPrints.length > 0){
                    return rankingsFingerPrint;
                } else {
                    return rankingService.calculateAndStoreRankings(rankingsFingerPrint, rankingSystem);
                }
            });
        });
    });
};

rankingService.getRankingsFingerPrint = function(periodStart, periodEnd, rankingSystem){
    return placingService.collectionFingerPrint().then(function(placingCollectionFingerPrint){
        if (rankingSystem.updatedAt != null){
            //encode dates as base64 to generate rankingsFingerPrint
            return rankingService.generateRankingsFingerPrint(
                    periodStart,
                    periodEnd,
                    rankingSystem.updatedAt) + "." + placingCollectionFingerPrint;
        } else {
            return q.reject("rankingSystem does not have an updatedAt field");
        }
    });
};

rankingService.calculateAndStoreRankings = function(rankingsFingerPrint, rankingSystem){
    if (rankingSystem != null && rankingSystem.groupBy != null && rankingSystem.groupBy != null && rankingSystem.groupBy.label != null && rankingSystem.groupBy.field != null){
        return scoreService.generateRankingsFromScores(rankingsFingerPrint, rankingSystem).then(function(){
            return rankingService.addRankToRankingSet(rankingsFingerPrint).then(function(){
                return rankingsFingerPrint;
            });
        });
    } else {
        log.warn("ranking system must have a valid group by field");
        q.reject("ranking system must have a valid group by field");
    }
};

rankingService.addRankToRankingSet = function(rankingsFingerPrint){
    return rankingService.find({fingerPrint: rankingsFingerPrint}).then(function(rankings){
        var proms = rankings.map(function(ranking){
            return rankingService.count({fingerPrint: rankingsFingerPrint, "totalPoints":{"$gt":ranking.totalPoints}}).then(function(count){
                ranking.rank = count+1;
                return rankingService.update(ranking);
            });
        });
        return q.allSettled(proms).then(function(results){
            return results.filter(function(item){
                return item.state == 'fulfilled';
            }).map(function(i){return i.value;});
        });
    });
};

rankingService.generateRankingsFingerPrint = function(periodStart, periodEnd, rankingSystemRefUpdateDate){
    var baseFingerPrint = "";

    if (periodStart != null){
        baseFingerPrint += periodStart.getTime().toString();
    }
    if (periodEnd != null){
        baseFingerPrint += periodEnd.getTime().toString();
    }
    if (rankingSystemRefUpdateDate != null){
        baseFingerPrint += rankingSystemRefUpdateDate.getTime().toString();
    }

    return new Buffer(baseFingerPrint).toString('base64');
};

rankingService.getCompleteRankingSystem = function(periodStart, periodEnd, rankingSystemRef){
    return rankingService.getRankingSystem(rankingSystemRef).then(function(rankingSystem){
        rankingSystem = rankingSystem.toObject();
        rankingSystem = rankingService.addPeriodCriteria(periodStart, periodEnd, rankingSystem);
        rankingSystem = rankingService.insertCommonCriteria(rankingSystem);
        return rankingSystem;
    });
};

rankingService.addPeriodCriteria = function(periodStart, periodEnd, rankingSystem){
    if (periodStart != null && _.isDate(periodStart)){
        rankingSystem.commonCriteria.push({field: "race.date", "comparator": ">=", "value": periodStart, type: "Date"});
    }
    if (periodEnd != null && _.isDate(periodEnd)){
        rankingSystem.commonCriteria.push({field: "race.date", "comparator": "<=", "value": periodEnd, type: "Date"});
    }
    return rankingSystem;
};

rankingService.getRankingSystem = function(rankingSystemRef){
    if (rankingSystemRef != null){
        return mongoService.findOneById(RankingSystem, rankingSystemRef).then(function(rankingSystem){
            if (rankingSystem != null){
                return q(rankingSystem);
            } else {
                return q.reject("must be a valid ranking system ref");
            }
        });
    } else {
        return mongoService.findOne(Setting, {settingType: "system"}).then(function(systemSettings){
            if (systemSettings != null && systemSettings.defaultRankingSystem != null){
                return mongoService.findOneById(RankingSystem, systemSettings.defaultRankingSystem).then(function(rankingSystem){
                    if (rankingSystem != null){
                        return q(rankingSystem);
                    } else {
                        return q.reject("cannot find any default ranking systems");
                    }
                });
            } else {
                return q.reject("cannot find any default ranking systems");
            }
        });
    }
};

rankingService.insertCommonCriteria = function(rankingSystem){
    rankingSystem.pointAllotments.forEach(function(pointAllotment){
        if (rankingSystem.commonCriteria != null && rankingSystem.commonCriteria.length > 0){
            pointAllotment.criteria = pointAllotment.criteria.concat(rankingSystem.commonCriteria);
        }
    });
    return rankingSystem;
};

rankingService.transformCSV = function(ranking){
    var exportFormat = {};
    exportFormat.rank = ranking.rank;
    exportFormat.name = ranking.greyhoundName;
    exportFormat.points = ranking.totalPoints;
    return exportFormat;
};

rankingService.toCSVGrid = function(rankings){
    var colSize = 34;
    var results = [];
    for (var i=0; i<colSize;i++){
        var result = {};
        var col1 = rankings[i];
        var col2 = rankings[i+colSize];
        var col3 = rankings[i+colSize*2];
        if (col1 != null){
            result.rank1 = col1.rank;
            result.name1 = col1.greyhoundName;
            result.pts1 = col1.totalPoints;
        }
        if (col2 != null){
            result.rank2 = col2.rank;
            result.name2 = col2.greyhoundName;
            result.pts2 = col2.totalPoints;
        }
        if (col3 != null){
            result.rank3 = col3.rank;
            result.name3 = col3.greyhoundName;
            result.pts3 = col3.totalPoints;
        }
        results.push(result);
    }
    return results;
};