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

rankingService.calculateRankings = function(rankingSystemRef, fromDate, toDate, limit){
    if (limit == null || limit > 100) limit = 100;

    return mongoService.findOneById(RankingSystem, rankingSystemRef).then(function(rankingSystem){
        if (rankingSystem != null){
            rankingService.insertDatesIntoPointAllotments(rankingSystem, fromDate, toDate);
            return rankingService.convertPointAllotmentsToPlacingsPoints(rankingSystem.pointAllotments)
                .then(function(pointPlacings){
                    var rankings = rankingService.sumPlacingsIntoRankings(pointPlacings);
                    return rankingService.addRankingPosition(rankings).slice(0, limit);
                });
        } else {
            return q.reject("must be a valid ranking system ref");
        }
    });
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

rankingService.convertPointAllotmentsToPlacingsPoints = function(pointAllotments){
    var proms = pointAllotments.map(rankingService.convertPointAllotmentToPlacingsPoints);
    return q.allSettled(proms).then(function(results){
        return results.filter(function(item){
            return item.state == 'fulfilled';
        }).map(function(i){return i.value;});
    }).then(function(arrayOfPointPlacings){
        return _.flatten(arrayOfPointPlacings)
    });
};

rankingService.convertPointAllotmentToPlacingsPoints = function(pointAllotment){
    var query = rankingService.getQueryForPointAllotment(pointAllotment);
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

rankingService.sumPlacingsIntoRankings = function(placingPoints){
    var grouped = _.groupBy(placingPoints, function(placingPoint){
        return placingPoint.placing.greyhoundRef;
    });

    return _.keys(grouped).map(function(greyhoundRef){
        var placingPointsForGreyhound = grouped[greyhoundRef];
        var greyhoundName = rankingService.getGreyhoundNameFromPlacingSet(placingPointsForGreyhound);
        placingPointsForGreyhound = placingPointsForGreyhound.map(function(placingPoint){
            return rankingService.getPlacingReferenceFromPlacingPoint(placingPoint);
        });
        var totalPoints = placingPointsForGreyhound.reduce(function(sum, placingPoint){
            return sum + placingPoint.points;
        }, 0);

        return {
            greyhoundRef : greyhoundRef,
            greyhoundName : greyhoundName,
            placingPoints : placingPointsForGreyhound,
            totalPoints: totalPoints
        };
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

rankingService.getQueryForPointAllotment = function(pointAllotment){
    var query = {};
    pointAllotment.criteria.forEach(function(criteria){
        //replace placeholders
        if (criteria.value != null && _.isString(criteria.value) &&  criteria.value.indexOf('##') == 0){
            criteria.value = rankingService.convertPlaceHolder(criteria.value);
        }
    });

    pointAllotment.criteria.forEach(function(criteria){
        switch (criteria.comparator){
            case "=":
                query[criteria.field] = criteria.value;
                break;
            case ">":
                helper.addField(query, criteria.field, {"$gt": criteria.value});
                break;
            case "<":
                helper.addField(query, criteria.field, {"$lt": criteria.value});
                break;
            case ">=":
                helper.addField(query, criteria.field, {"$gte": criteria.value});
                break;
            case "<=":
                helper.addField(query, criteria.field, {"$lte": criteria.value});
                break;
            case "!=":
                helper.addField(query, criteria.field, {"$ne": criteria.value});
                break;
            default:
                query[criteria.field] = criteria.value;
                break;
        }
    });
    return query;
};

rankingService.convertPlaceHolder = function(placeholder){
    switch (placeholder){
        case "##currentFinancialYear.start":
            return rankingService.getFinancialYearForDate(new Date()).start;
            break;
        case "##currentFinancialYear.end":
            return rankingService.getFinancialYearForDate(new Date()).end;
            break;
        default:
            return placeholder;
            break;
    }
};

rankingService.getFinancialYearForDate = function(now){
    var midYear = moment(now).set('month', 7).set('date', 1).startOf('day');
    if (midYear.isAfter(now)){
        return { start: midYear.clone().subtract(12, 'months').toDate(), end : midYear.subtract(1, 'days').endOf('day').toDate()};
    } else {
        return { start: midYear.toDate(), end : midYear.clone().add(12, 'months').subtract(1, 'days').endOf('day').toDate()};
    }
};