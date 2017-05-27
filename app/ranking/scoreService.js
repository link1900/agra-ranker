const scoreService = module.exports = {};

const q = require('q');

const placingService = require('../placing/placingService');
const rankingService = require('./rankingService');
const Ranking = require('./ranking').model;
const Score = require('./score').model;
const rankingSystemService = require('./rankingSystemService');
const baseService = require('../baseService');

baseService.addStandardServiceMethods(scoreService, Score);

scoreService.generateRankingsFromScores = function (rankingsFingerPrint, rankingSystem) {
    const scoreCreationQueries = scoreService.getScoreCreationQueries(rankingSystem);
    return scoreService.createScores(rankingSystem, scoreCreationQueries, rankingsFingerPrint).then(() => {
        return scoreService.sumScoresIntoRankings(rankingSystem, rankingsFingerPrint).then(() => {
            return scoreService.removeAll({ fingerPrint: rankingsFingerPrint });
        });
    });
};

scoreService.createScores = function (rankingSystem, pipelines, rankingsFingerPrint) {
    const proms = pipelines.map((pipeline) => {
        return scoreService.createScore(rankingSystem, pipeline, rankingsFingerPrint);
    });
    return q.allSettled(proms).then((results) => {
        return results.filter((item) => {
            return item.state == 'fulfilled';
        }).map((i) => { return i.value; });
    });
};

scoreService.createScore = function (rankingSystem, pipeline, rankingsFingerPrint) {
    return placingService.aggregate(pipeline).then((results) => {
        const proms = results.map((result) => {
            const score = new Score({
                fingerPrint: rankingsFingerPrint,
                rankingSystemRef: rankingSystem._id,
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
        return q.allSettled(proms).then((results) => {
            return results.filter((item) => {
                return item.state == 'fulfilled';
            }).map((i) => { return i.value; });
        });
    });
};

scoreService.sumScoresIntoRankings = function (rankingSystem, rankingsFingerPrint) {
    const pipeline = [
        { $match: { fingerPrint: rankingsFingerPrint } },
        { $group: { _id: { ref: '$ref', name: '$name' },
            totalPoints: { $sum: '$points' },
            scores: { $push: { points: '$points', placingRef: '$placingRef', position: '$position', raceName: '$raceName', raceRef: '$raceRef' } } } }
    ];

    return scoreService.aggregate(pipeline).then((results) => {
        const proms = results.map((result) => {
            const ranking = new Ranking({
                fingerPrint: rankingsFingerPrint,
                rankingSystemRef: rankingSystem._id,
                greyhoundRef: result._id.ref,
                greyhoundName: result._id.name,
                totalPoints: result.totalPoints,
                scores: result.scores
            });
            return rankingService.create(ranking);
        });
        return q.allSettled(proms).then((results) => {
            return results.filter((item) => {
                return item.state == 'fulfilled';
            }).map((i) => { return i.value; });
        });
    });
};

scoreService.getScoreCreationQueries = function (rankingSystem) {
    return rankingSystem.pointAllotments.map((pointAllotment) => {
        return scoreService.getScoreCreationQuery(rankingSystem.groupBy, pointAllotment);
    });
};

scoreService.getScoreCreationQuery = function (groupBy, pointAllotment) {
    const match = rankingSystemService.getQueryForPointAllotment(pointAllotment);
    const projection = {
        race: '$race',
        placing: '$placing',
        name: `$${groupBy.label}`,
        ref: `$${groupBy.field}`,
        points: { $literal: pointAllotment.points },
        placingRef: '$_id',
        position: '$placing',
        raceRef: '$raceRef',
        raceName: '$race.name'
    };
    return [
        { $match: match },
        { $project: projection }
    ];
};

