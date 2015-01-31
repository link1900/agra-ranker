var rankingService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var moment = require('moment');

var Placing = require('../placing/placing').model;
var Race = require('../race/race').model;
var Greyhound = require('../greyhound/greyhound').model;
var greyhoundService = require('../greyhound/greyhoundService');
var helper = require('../helper');
var mongoService = require('../mongoService');
var RankingSystem = require('./rankingSystem').model;
var Ranking = require('./ranking').model;
var rankingSystemService = require('./rankingSystemService');
var eventService = require('../event/eventService');
var batchService = require('../batch/batchService');

rankingService.calculateRankings = function(rankingSystemRef){
    return rankingService.getRankingSystem(rankingSystemRef).then(function(rankingSystem){
        rankingService.insertCommonCriteria(rankingSystem);
        return rankingService.convertPointAllotmentsToPlacingsPoints(rankingSystem.pointAllotments)
            .then(function(pointPlacings){
                var rankings = rankingService.sumPlacingsIntoRankings(pointPlacings, true);
                rankings = rankings.map(function(ranking){
                    ranking.rankingSystemRef = rankingSystem._id.toString();
                    return ranking;
                });
                return rankingService.addRankingPosition(rankings);
            });
    });
};

rankingService.calculateAndStoreRankings = function(rankingSystemRef){
    return rankingService.calculateRankings(rankingSystemRef).then(function(rankings){
        return mongoService.removeAll(Ranking, {'rankingSystemRef' : rankingSystemRef}).then(function(){
            return mongoService.saveAllAtOnce(rankings.map(function(ranking){
                return new Ranking(ranking);
            })).then(function(result){
                eventService.logEvent({type:"Rankings Calculated", data: rankingSystemRef});
                return q(result);
            });
        });
    });
};

rankingService.calculateAndStoreAllRankings = function(){
    return mongoService.find(RankingSystem, {}).then(function(rankingSystems){
        var rankingSystemRefs = rankingSystems.map(function(rankingSystem){
            return rankingSystem._id.toString();
        });

        var proms = rankingSystemRefs.map(function(rankingSystemRef){
            return rankingService.calculateAndStoreRankings(rankingSystemRef);
        });

        return q.allSettled(proms).then(function(results){
            return q(results);
        });
    });
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
        return mongoService.findOne(RankingSystem, {'defaultRanking': true}).then(function(rankingSystem){
            if (rankingSystem != null){
                return q(rankingSystem);
            } else {
                return q.reject("cannot find any default ranking systems");
            }
        });
    }
};

rankingService.insertCommonCriteria = function(rankingSystem){
    rankingSystem.pointAllotments.forEach(function(pointAllotment){
        if (rankingSystem.commonCriteria != null && rankingSystem.commonCriteria.length > 0){
            pointAllotment.criteria.concat(rankingSystem.commonCriteria);
        }
    });
};

rankingService.convertPointAllotmentsToPlacingsPoints = function(pointAllotments){
    var proms = pointAllotments.map(rankingService.convertPointAllotmentToPlacingsPoints);
    return q.allSettled(proms).then(function(results){
        return results.filter(function(item){
            return item.state == 'fulfilled';
        }).map(function(i){return i.value;});
    }).then(function(arrayOfPointPlacings){
        return _.flatten(arrayOfPointPlacings);
    });
};

rankingService.convertPointAllotmentToPlacingsPoints = function(pointAllotment){
    var query = rankingSystemService.getQueryForPointAllotment(pointAllotment);
    return mongoService.find(Placing, query).then(function(placings){
        //map placing results into placings with points
        return placings.map(function(placing){
            return {
                points: pointAllotment.points,
                placing: placing
            };
        });
    });
};

rankingService.sumPlacingsIntoRankings = function(placingPoints, includePlacings){
    var grouped = _.groupBy(placingPoints, function(placingPoint){
        return placingPoint.placing.greyhoundRef;
    });

    return _.keys(grouped).map(function(greyhoundRef){
        var placingPointsForGreyhound = grouped[greyhoundRef];
        var greyhoundName = rankingService.getGreyhoundNameFromPlacingSet(placingPointsForGreyhound);
        if (includePlacings){
            placingPointsForGreyhound = placingPointsForGreyhound.map(function(placingPoint){
                return rankingService.getPlacingReferenceFromPlacingPoint(placingPoint);
            });
        }

        var totalPoints = placingPointsForGreyhound.reduce(function(sum, placingPoint){
            return sum + placingPoint.points;
        }, 0);

        var rankingResult = {
            greyhoundRef : greyhoundRef,
            greyhoundName : greyhoundName,
            totalPoints: totalPoints
        };

        if (includePlacings){
            rankingResult.placingPoints =  placingPointsForGreyhound;
        }

        return rankingResult;
    });
};

rankingService.getGreyhoundNameFromPlacingSet = function(placingPointSet){
    var foundPlacingPoint = _.first(placingPointSet);
    if (foundPlacingPoint != null && foundPlacingPoint.placing && foundPlacingPoint.placing.greyhound &&
        foundPlacingPoint.placing.greyhound.name){
        return foundPlacingPoint.placing.greyhound.name;
    } else {
        return "";
    }
};

rankingService.getPlacingReferenceFromPlacingPoint = function(placingPoint){
    var points = 0;
    var placingRef = "";
    var position = "";
    var raceName = "";

    if (placingPoint && placingPoint.points){
        points = placingPoint.points
    }

    if (placingPoint && placingPoint.placing && placingPoint.placing._id){
        placingRef = placingPoint.placing._id.toString()
    }

    if (placingPoint && placingPoint.placing && placingPoint.placing.placing){
        position = placingPoint.placing.placing;
    }

    if (placingPoint && placingPoint.placing && placingPoint.placing.race && placingPoint.placing.race.name){
        raceName = placingPoint.placing.race.name;
    }

    return {
        points: points,
        placingRef: placingRef,
        position: position,
        raceName: raceName
    };
};

rankingService.addRankingPosition = function(rankings){
    rankings.sort(function(a, b) {
        return b.totalPoints - a.totalPoints;
    });

    var rankIndex = 0;
    for (var i=0; i<rankings.length;i++){
        if(i>0 && rankings[i-1].totalPoints == rankings[i].totalPoints){
            rankings[i].rank = rankIndex;
        } else {
            rankIndex++;
            rankings[i].rank = rankIndex;
        }
    }

    return rankings;
};

eventService.addListener(/.*_Placing/, function(){
    return batchService.createBatch("Calculate All Rankings", {});
});

rankingService.createRankingCalculateBatchJob = function(rankingSystemRef){
    return batchService.createBatch("Calculate Rankings", {rankingSystemRef: rankingSystemRef});
};

rankingService.calculateRankingsBatchJob = function(batchJob){
    var startDate = new Date();
    if (batchJob.metadata != null && batchJob.metadata.rankingSystemRef != null){
        return rankingService.calculateAndStoreRankings(batchJob.metadata.rankingSystemRef).then(function(){
            return batchService.createBatchResult(batchJob._id,
                1,
                batchService.getBatchResultFromBoolean(true),
                startDate,
                "Calculated rankings for ranking system ref " +batchJob.metadata.rankingSystemRef,
                []);
        });
    } else {
        return q.reject({"error": "missing metadata"});
    }
};

rankingService.calculateAllRankingsBatchJob = function(batchJob){
    var startDate = new Date();
    return rankingService.calculateAndStoreAllRankings().then(function(){
        return batchService.createBatchResult(batchJob._id,
            1,
            batchService.getBatchResultFromBoolean(true),
            startDate,
            "Calculated rankings for all ranking systems",
            []);
    });
};

batchService.loadBatchHandler("Calculate Rankings", rankingService.calculateRankingsBatchJob);
batchService.loadBatchHandler("Calculate All Rankings", rankingService.calculateAllRankingsBatchJob);
