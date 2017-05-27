const assert = require('assert');
const testHelper = require('./testHelper');
const Placing = require('../app/placing/placing').model;
const Score = require('../app/ranking/score').model;
const Ranking = require('../app/ranking/ranking').model;

let scoreService = null;

describe('scoreService', () => {
    const placing1 = {
        greyhound: {
            name: 'dog1'
        },
        race: {
            distanceMeters: 500,
            date: new Date(),
            groupLevelName: 'Group 3',
            name: 'race1',
            disqualified: false
        },
        placing: '3',
        raceRef: '5525009dc913f92a174f781a',
        greyhoundRef: '5517af08f80dcb0000248f87'
    };

    const placing2 = {
        greyhound: {
            name: 'dog1'
        },
        race: {
            distanceMeters: 500,
            date: new Date(),
            groupLevelName: 'Group 3',
            name: 'race2',
            disqualified: false
        },
        placing: '4',
        raceRef: '5525009dc913f92a174f781b',
        greyhoundRef: '5517af08f80dcb0000248f87'
    };

    const placing3 = {
        greyhound: {
            name: 'dog1'
        },
        race: {
            distanceMeters: 500,
            date: new Date(),
            groupLevelName: 'Group 3',
            name: 'race3',
            disqualified: false
        },
        placing: '5',
        raceRef: '5525009dc913f92a174f781c',
        greyhoundRef: '5517af08f80dcb0000248f87'
    };

    before((done) => {
        testHelper.setup(() => {
            scoreService = require('../app/ranking/scoreService');
            Ranking.remove({}, () => {
                Score.remove({}, () => {
                    Placing.remove({}, () => {
                        new Placing(placing1).save(() => {
                            new Placing(placing2).save(() => {
                                new Placing(placing3).save(() => {
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    after((done) => {
        Ranking.remove({}, () => {
            Score.remove({}, () => {
                Placing.remove({}, () => {
                    done();
                });
            });
        });
    });

    describe('#getScoreCreationQuery', () => {
        it('returns correct creation query', () => {
            const pa = {
                criteria: [
                    { field: 'placing', comparator: '=', value: '1' },
                    { field: 'race.groupLevelName', comparator: '=', value: 'Group 3' },
                    { field: 'race.distanceMeters', comparator: '<', value: 715 }
                ],
                points: 20
            };
            const group = {
                label: 'fieldName', field: 'fieldField'
            };
            const expected = [
                { $match: { 'race.groupLevelName': 'Group 3',
                    'race.distanceMeters': { $lt: 715 },
                    placing: '1' } },
                { $project: { race: '$race',
                    placing: '$placing',
                    name: '$fieldName',
                    ref: '$fieldField',
                    points: { $literal: 20 },
                    placingRef: '$_id',
                    position: '$placing',
                    raceName: '$race.name',
                    raceRef: '$raceRef'
                } }

            ];
            const result = scoreService.getScoreCreationQuery(group, pa);
            assert.deepEqual(result, expected);
        });
    });

    describe('#getScoreCreationQueries', () => {
        it('returns a set of creation queries', () => {
            const pa = {
                criteria: [
                    { field: 'placing', comparator: '=', value: '1' },
                    { field: 'race.groupLevelName', comparator: '=', value: 'Group 3' },
                    { field: 'race.distanceMeters', comparator: '<', value: 715 }
                ],
                points: 20
            };
            const group = {
                label: 'fieldName', field: 'fieldField'
            };
            const rs = { pointAllotments: [pa], groupBy: group };
            const expected = [[
                { $match: { 'race.groupLevelName': 'Group 3',
                    'race.distanceMeters': { $lt: 715 },
                    placing: '1' } },
                { $project: { race: '$race',
                    placing: '$placing',
                    name: '$fieldName',
                    ref: '$fieldField',
                    points: { $literal: 20 },
                    placingRef: '$_id',
                    position: '$placing',
                    raceName: '$race.name',
                    raceRef: '$raceRef'
                } }

            ]];
            const result = scoreService.getScoreCreationQueries(rs);
            assert.deepEqual(result, expected);
        });
    });

    describe('#sumScoresIntoRankings', () => {
        before((done) => {
            const score1 = {
                fingerPrint: 'sumScoresIntoRankingsTest',
                rankingSystemRef: 'rankingSystemTest',
                ref: '5517af08f80dcb0000248f87',
                name: 'dog1',
                points: 20,
                placingRef: 'placingRef1',
                position: '3',
                raceName: 'race1'
            };

            const score2 = {
                fingerPrint: 'sumScoresIntoRankingsTest',
                rankingSystemRef: 'rankingSystemTest',
                ref: '5517af08f80dcb0000248f87',
                name: 'dog1',
                points: 20,
                placingRef: 'placingRef1',
                position: '4',
                raceName: 'race2'
            };

            new Score(score1).save(() => {
                new Score(score2).save(() => {
                    done();
                });
            });
        });

        after((done) => {
            Score.remove({}, () => {
                Ranking.remove({}, () => {
                    done();
                });
            });
        });

        it('creates rankings', (done) => {
            const rankingSystem = {
                _id: 'rankingSystemTest'
            };

            scoreService.sumScoresIntoRankings(rankingSystem, 'sumScoresIntoRankingsTest').then(() => {
                Ranking.find({}, (err, res) => {
                    if (err) { done(err); }
                    assert.equal(res[0].totalPoints, 40);
                    done();
                });
            });
        });
    });

    describe('#createScore', () => {
        after((done) => {
            Score.remove({}, () => {
                done();
            });
        });

        it('creates a correct score', (done) => {
            const rs = {};
            const fp = 'createScoreTest';
            const pipeline = [
                { $match: { 'race.groupLevelName': 'Group 3', placing: '3' } },
                { $project: { race: '$race',
                    placing: '$placing',
                    name: '$greyhound.name',
                    ref: '$greyhoundRef',
                    points: { $literal: 20 },
                    placingRef: '$_id',
                    position: '$placing',
                    raceName: '$race.name' } }
            ];
            scoreService.createScore(rs, pipeline, fp).then(() => {
                Score.find({ fingerPrint: 'createScoreTest' }, (err, res) => {
                    if (err) { done(err); }
                    assert.equal(res[0].points, 20);
                    assert.equal(res[0].name, 'dog1');
                    assert.equal(res[0].position, '3');
                    assert.equal(res[0].ref, '5517af08f80dcb0000248f87');
                    done();
                });
            });
        });
    });

    describe('#generateRankingsFromScores', () => {
        it('can create rankings correctly');
    });
});
