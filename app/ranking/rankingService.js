const rankingService = module.exports = {};

const _ = require('lodash');
const q = require('q');

const placingService = require('../placing/placingService');
const mongoService = require('../mongoService');
const RankingSystem = require('./rankingSystem').model;
const Ranking = require('./ranking').model;
const scoreService = require('./scoreService');
const baseService = require('../baseService');
const Setting = require('../setting/setting').model;

baseService.addStandardServiceMethods(rankingService, Ranking);

/**
 * Main method for creating the rankings. Will not create rankings if a valid ranking set already exists.
 */
rankingService.createRankingsIfRequired = function (periodStart, periodEnd, rankingSystemRef) {
    // get complete ranking system
    return rankingService.getCompleteRankingSystem(periodStart, periodEnd, rankingSystemRef).then((rankingSystem) => {
        // get ranking finger print
        return rankingService.getRankingsFingerPrint(periodStart, periodEnd, rankingSystem).then((rankingsFingerPrint) => {
            return rankingService.distinctField('fingerPrint', { fingerPrint: rankingsFingerPrint }).then((fingerPrints) => {
                if (fingerPrints != null && fingerPrints.length > 0) {
                    return rankingsFingerPrint;
                } else {
                    return rankingService.calculateAndStoreRankings(rankingsFingerPrint, rankingSystem);
                }
            });
        });
    });
};

rankingService.getRankingsFingerPrint = function (periodStart, periodEnd, rankingSystem) {
    return placingService.collectionFingerPrint().then((placingCollectionFingerPrint) => {
        if (rankingSystem.updatedAt != null) {
            // encode dates as base64 to generate rankingsFingerPrint
            return `${rankingService.generateRankingsFingerPrint(
                    periodStart,
                    periodEnd,
                    rankingSystem.updatedAt)}.${placingCollectionFingerPrint}`;
        } else {
            return q.reject('rankingSystem does not have an updatedAt field');
        }
    });
};

rankingService.calculateAndStoreRankings = function (rankingsFingerPrint, rankingSystem) {
    if (rankingSystem != null && rankingSystem.groupBy != null && rankingSystem.groupBy != null && rankingSystem.groupBy.label != null && rankingSystem.groupBy.field != null) {
        return scoreService.generateRankingsFromScores(rankingsFingerPrint, rankingSystem).then(() => {
            return rankingService.addRankToRankingSet(rankingsFingerPrint).then(() => {
                return rankingsFingerPrint;
            });
        });
    } else {
        q.reject('ranking system must have a valid group by field');
    }
};

rankingService.addRankToRankingSet = function (rankingsFingerPrint) {
    return rankingService.find({ fingerPrint: rankingsFingerPrint }).then((rankings) => {
        const proms = rankings.map((ranking) => {
            return rankingService.count({ fingerPrint: rankingsFingerPrint, totalPoints: { $gt: ranking.totalPoints } }).then((count) => {
                ranking.rank = count + 1;
                return rankingService.update(ranking);
            });
        });
        return q.allSettled(proms).then((results) => {
            return results.filter((item) => {
                return item.state === 'fulfilled';
            }).map((i) => { return i.value; });
        });
    });
};

rankingService.generateRankingsFingerPrint = function (periodStart, periodEnd, rankingSystemRefUpdateDate) {
    let baseFingerPrint = '';

    if (periodStart != null) {
        baseFingerPrint += periodStart.getTime().toString();
    }
    if (periodEnd != null) {
        baseFingerPrint += periodEnd.getTime().toString();
    }
    if (rankingSystemRefUpdateDate != null) {
        baseFingerPrint += rankingSystemRefUpdateDate.getTime().toString();
    }

    return new Buffer(baseFingerPrint).toString('base64');
};

rankingService.getCompleteRankingSystem = function (periodStart, periodEnd, rankingSystemRef) {
    return rankingService.getRankingSystem(rankingSystemRef).then((rankingSystem) => {
        rankingSystem = rankingSystem.toObject();
        rankingSystem = rankingService.addPeriodCriteria(periodStart, periodEnd, rankingSystem);
        rankingSystem = rankingService.insertCommonCriteria(rankingSystem);
        return rankingSystem;
    });
};

rankingService.addPeriodCriteria = function (periodStart, periodEnd, rankingSystem) {
    if (periodStart != null && _.isDate(periodStart)) {
        rankingSystem.commonCriteria.push({ field: 'race.date', comparator: '>=', value: periodStart, type: 'Date' });
    }
    if (periodEnd != null && _.isDate(periodEnd)) {
        rankingSystem.commonCriteria.push({ field: 'race.date', comparator: '<=', value: periodEnd, type: 'Date' });
    }
    return rankingSystem;
};

rankingService.getRankingSystem = function (rankingSystemRef) {
    if (rankingSystemRef != null) {
        return mongoService.findOneById(RankingSystem, rankingSystemRef).then((rankingSystem) => {
            if (rankingSystem != null) {
                return q(rankingSystem);
            } else {
                return q.reject('must be a valid ranking system ref');
            }
        });
    } else {
        return mongoService.findOne(Setting, { settingType: 'system' }).then((systemSettings) => {
            if (systemSettings != null && systemSettings.defaultRankingSystem != null) {
                return mongoService.findOneById(RankingSystem, systemSettings.defaultRankingSystem).then((rankingSystem) => {
                    if (rankingSystem != null) {
                        return q(rankingSystem);
                    } else {
                        return q.reject('cannot find any default ranking systems');
                    }
                });
            } else {
                return q.reject('cannot find any default ranking systems');
            }
        });
    }
};

rankingService.insertCommonCriteria = function (rankingSystem) {
    rankingSystem.pointAllotments.forEach((pointAllotment) => {
        if (rankingSystem.commonCriteria != null && rankingSystem.commonCriteria.length > 0) {
            pointAllotment.criteria = pointAllotment.criteria.concat(rankingSystem.commonCriteria);
        }
    });
    return rankingSystem;
};

rankingService.transformCSV = function (ranking) {
    const exportFormat = {};
    exportFormat.rank = ranking.rank;
    exportFormat.name = ranking.greyhoundName;
    exportFormat.points = ranking.totalPoints;
    return exportFormat;
};

rankingService.toCSVGrid = function (rankings) {
    const colSize = 34;
    const results = [];
    for (let i = 0; i < colSize; i+=1) {
        const result = {};
        const col1 = rankings[i];
        const col2 = rankings[i + colSize];
        const col3 = rankings[i + (colSize * 2)];
        if (col1) {
            result.rank1 = col1.rank;
            result.name1 = col1.greyhoundName;
            result.pts1 = col1.totalPoints;
        }
        if (col2) {
            result.rank2 = col2.rank;
            result.name2 = col2.greyhoundName;
            result.pts2 = col2.totalPoints;
        }
        if (col3) {
            result.rank3 = col3.rank;
            result.name3 = col3.greyhoundName;
            result.pts3 = col3.totalPoints;
        }
        results.push(result);
    }
    return results;
};
