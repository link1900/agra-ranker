const assert = require('assert');
const testHelper = require('./testHelper');
const Placing = require('../app/placing/placing').model;
const RankingSystem = require('../app/ranking/rankingSystem').model;
const Ranking = require('../app/ranking/ranking').model;

let rankingService = null;

describe('rankingService', () => {
    before((done) => {
        testHelper.setup(() => {
            Placing.remove({}, () => {
                rankingService = require('../app/ranking/rankingService');
                testHelper.setupRankingTestData(done);
            });
        });
    });

    describe('#createRankingsIfRequired', () => {
        it('create rankings when no finger print found');

        it('just return finger print when ranking set exists');
    });

    describe('#getRankingsFingerPrint', () => {
        it('generate the same finger print for the same data');

        it('generate different finger prints for different data');
    });

    describe('#calculateAndStoreRankings', () => {
        it('create rankings correctly');
    });

    describe('#addRankToRankingSet', () => {
        before((done) => {
            const ranking1 = {
                fingerPrint: '123fakestreet',
                rankingSystemRef: '54ac8b031ee51022d545c8fc',
                greyhoundRef: '54ac8d5e1ee51022d545c8fe',
                greyhoundName: 'john',
                totalPoints: 30,
                placingPoints: []
            };

            const ranking2 = {
                fingerPrint: '123fakestreet',
                rankingSystemRef: '54ac8b031ee51022d545c8fc',
                greyhoundRef: '54ac8d5e1ee51022d545c8fe',
                greyhoundName: 'sally',
                totalPoints: 20,
                placingPoints: []
            };

            const ranking3 = {
                fingerPrint: '123fakestreet',
                rankingSystemRef: '54ac8b031ee51022d545c8fc',
                greyhoundRef: '54ac8d5e1ee51022d545c8fe',
                greyhoundName: 'dan',
                totalPoints: 20,
                placingPoints: []
            };

            const ranking4 = {
                fingerPrint: '123fakestreet',
                rankingSystemRef: '54ac8b031ee51022d545c8fc',
                greyhoundRef: '54ac8d5e1ee51022d545c8fe',
                greyhoundName: 'jimbo',
                totalPoints: 10,
                placingPoints: []
            };
            Ranking.remove({}, () => {
                new Ranking(ranking1).save(() => {
                    new Ranking(ranking2).save(() => {
                        new Ranking(ranking3).save(() => {
                            new Ranking(ranking4).save(() => {
                                done();
                            });
                        });
                    });
                });
            });
        });

        it('update the rankings with the correct ranks', (done) => {
            rankingService.addRankToRankingSet('123fakestreet').then(() => {
                return rankingService.find({}, 10, 0, { rank: 1 }).then((rankings) => {
                    assert(rankings != null);
                    assert.equal(rankings.length, 4);
                    assert.equal(rankings[0].totalPoints, 30);
                    assert.equal(rankings[0].greyhoundName, 'john');
                    assert.equal(rankings[0].rank, 1);
                    assert.equal(rankings[1].rank, 2);
                    assert.equal(rankings[2].rank, 2);
                    assert.equal(rankings[3].rank, 4);
                    done();
                }, (err) => {
                    done(err);
                }).catch((err) => {
                    done(err);
                });
            }, (err) => { done(err); }).catch((err) => {
                done(err);
            });
        });
    });

    describe('#generateRankingsFingerPrint', () => {
        it('generate finger print for ranking set', () => {
            const d1 = new Date();
            const d2 = new Date();
            const d3 = new Date();
            const expected = new Buffer(d1.getTime().toString() + d2.getTime().toString() + d3.getTime().toString()).toString('base64');
            const fp = rankingService.generateRankingsFingerPrint(d1, d2, d3);
            assert.equal(fp, expected);
        });
    });

    describe('#getCompleteRankingSystem', () => {
        it('merge all criteria into ranking system', (done) => {
            rankingService.getCompleteRankingSystem(new Date(), new Date(), '54ac8b031ee51022d545c8fc').then((rsc) => {
                assert(rsc.commonCriteria[1] != null);
                assert(rsc.commonCriteria[2] != null);
                assert(rsc.pointAllotments[0].criteria[3] != null);
                assert(rsc.pointAllotments[0].criteria[4] != null);
                assert(rsc.pointAllotments[0].criteria[5] != null);
                done();
            });
        });
    });

    describe('#addPeriodCriteria', () => {
        it('update criteria with dates', () => {
            const rankingSystem = {
                commonCriteria: [
                    { field: 'race.disqualified', comparator: '=', value: false }
                ]
            };
            const updatedRankingSystem = rankingService.addPeriodCriteria(new Date(), new Date(), rankingSystem);
            assert(updatedRankingSystem.commonCriteria[1] != null);
            assert(updatedRankingSystem.commonCriteria[2] != null);
        });
    });

    describe('#getRankingSystem', () => {
        it('find a ranking system or get the default', (done) => {
            rankingService.getRankingSystem('54ac8b031ee51022d545c8fc').then((rankingSystem) => {
                assert(rankingSystem != null);
                done();
            });
        });
    });

    describe('#insertCommonCriteria', () => {
        it('update criteria with common criteria', () => {
            const rankingSystem = {
                commonCriteria: [
                    { field: 'race.disqualified', comparator: '=', value: false }
                ],
                pointAllotments: [{
                    criteria: [
                        { field: 'placing', comparator: '=', value: '1' },
                        { field: 'race.groupLevelName', comparator: '=', value: 'Group 3' },
                        { field: 'race.distanceMeters', comparator: '<', value: 715 }
                    ],
                    points: 20
                }]
            };
            const updatedRankingSystem = rankingService.insertCommonCriteria(rankingSystem);
            assert.deepEqual({ field: 'race.disqualified', comparator: '=', value: false }, updatedRankingSystem.pointAllotments[0].criteria[3]);
        });
    });

    after((done) => {
        Ranking.remove({}, () => {
            RankingSystem.remove({}, () => {
                Placing.remove({}, () => {
                    testHelper.tearDown(done);
                });
            });
        });
    });
});
