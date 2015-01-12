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
var rankingSystemService = require('./rankingSystemService');

rankingService.calculateRankings = function(rankingSystemRef, fromDate, toDate){

    return rankingService.getRankingSystem(rankingSystemRef).then(function(rankingSystem){
        rankingService.insertDatesIntoPointAllotments(rankingSystem, fromDate, toDate);
        rankingService.insertCommonCriteria(rankingSystem);
        return rankingService.convertPointAllotmentsToPlacingsPoints(rankingSystem.pointAllotments)
            .then(function(pointPlacings){
                var rankings = rankingService.sumPlacingsIntoRankings(pointPlacings, false);
                return rankingService.addRankingPosition(rankings);
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

rankingService.insertDatesIntoPointAllotments = function(rankingSystem, fromDate, toDate){
    rankingSystem.pointAllotments.forEach(function(pointAllotment){
        if (fromDate != null && _.isDate(fromDate)){
            pointAllotment.criteria.push({field: "race.date", "comparator": ">=", "value": fromDate});
        }

        if (toDate != null && _.isDate(toDate)){
            pointAllotment.criteria.push({field: "race.date", "comparator": "<=", "value": toDate});
        }
    })
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
    var race = {name:""};

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
        race.name = placingPoint.placing.race.name;
    }

    return {
        points: points,
        placingRef: placingRef,
        position: position,
        race: race
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
