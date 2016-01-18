var assert = require('assert');
var testHelper = require('./testHelper');
var Placing = require('../app/placing/placing').model;
var RankingSystem = require('../app/ranking/rankingSystem').model;
var Ranking = require('../app/ranking/ranking').model;
var rankingService = null;

describe("rankingService", function(){

    before(function (done) {
        testHelper.setup(function(){
            Placing.remove({}, function(){
                rankingService = require('../app/ranking/rankingService');
                testHelper.setupRankingTestData(done);
            });
        });
    });

    describe("#createRankingsIfRequired", function(){
        it("create rankings when no finger print found");

        it("just return finger print when ranking set exists");
    });

    describe("#getRankingsFingerPrint", function(){
        it("generate the same finger print for the same data");

        it("generate different finger prints for different data");
    });

    describe("#calculateAndStoreRankings", function(){
        it("create rankings correctly");
    });

    describe("#addRankToRankingSet", function(){
        before(function(done){
            var ranking1 = {
                fingerPrint : "123fakestreet",
                rankingSystemRef : "54ac8b031ee51022d545c8fc",
                greyhoundRef: "54ac8d5e1ee51022d545c8fe",
                greyhoundName: "john",
                totalPoints : 30,
                placingPoints : []
            };

            var ranking2 = {
                fingerPrint : "123fakestreet",
                rankingSystemRef : "54ac8b031ee51022d545c8fc",
                greyhoundRef: "54ac8d5e1ee51022d545c8fe",
                greyhoundName: "sally",
                totalPoints : 20,
                placingPoints : []
            };

            var ranking3 = {
                fingerPrint : "123fakestreet",
                rankingSystemRef : "54ac8b031ee51022d545c8fc",
                greyhoundRef: "54ac8d5e1ee51022d545c8fe",
                greyhoundName: "dan",
                totalPoints : 20,
                placingPoints : []
            };

            var ranking4 = {
                fingerPrint : "123fakestreet",
                rankingSystemRef : "54ac8b031ee51022d545c8fc",
                greyhoundRef: "54ac8d5e1ee51022d545c8fe",
                greyhoundName: "jimbo",
                totalPoints : 10,
                placingPoints : []
            };
            Ranking.remove({}, function(){
                new Ranking(ranking1).save(function(){
                    new Ranking(ranking2).save(function(){
                        new Ranking(ranking3).save(function(){
                            new Ranking(ranking4).save(function(){
                                done();
                            });
                        });
                    });
                });
            });

        });

        it("update the rankings with the correct ranks", function(done){
            rankingService.addRankToRankingSet("123fakestreet").then(function(){
                return rankingService.find({}, 10,0,{rank:1}).then(function(rankings){
                    assert(rankings != null);
                    assert.equal(rankings.length,4);
                    assert.equal(rankings[0].totalPoints,30);
                    assert.equal(rankings[0].greyhoundName,"john");
                    assert.equal(rankings[0].rank,1);
                    assert.equal(rankings[1].rank,2);
                    assert.equal(rankings[2].rank,2);
                    assert.equal(rankings[3].rank,4);
                    done();
                }, function(err){
                    done(err);
                }).catch(function(err){
                    done(err);
                });
            }, function(err){done(err);}).catch(function(err){
                done(err);
            });
        });
    });

    describe("#generateRankingsFingerPrint", function(){
        it("generate finger print for ranking set", function(){
            var d1 = new Date();
            var d2 = new Date();
            var d3 = new Date();
            var expected = new Buffer(d1.getTime().toString()+d2.getTime().toString()+d3.getTime().toString()).toString('base64');
            var fp = rankingService.generateRankingsFingerPrint(d1, d2, d3);
            assert.equal(fp, expected);
        });
    });

    describe("#getCompleteRankingSystem", function(){
        it("merge all criteria into ranking system", function(done){
            rankingService.getCompleteRankingSystem(new Date(), new Date(), "54ac8b031ee51022d545c8fc").then(function(rsc){
                assert(rsc.commonCriteria[1] != null);
                assert(rsc.commonCriteria[2] != null);
                assert(rsc.pointAllotments[0].criteria[3] != null);
                assert(rsc.pointAllotments[0].criteria[4] != null);
                assert(rsc.pointAllotments[0].criteria[5] != null);
                done();
            });
        });
    });

    describe("#addPeriodCriteria", function(){
        it("update criteria with dates", function(){
            var rankingSystem = {
                commonCriteria: [
                    {field: "race.disqualified", "comparator": "=", "value": false}
                ]
            };
            var updatedRankingSystem = rankingService.addPeriodCriteria(new Date(), new Date(), rankingSystem);
            assert(updatedRankingSystem.commonCriteria[1]!= null);
            assert(updatedRankingSystem.commonCriteria[2]!= null);
        });
    });

    describe("#getRankingSystem", function(){
        it("find a ranking system or get the default", function(done){
            rankingService.getRankingSystem("54ac8b031ee51022d545c8fc").then(function(rankingSystem){
                assert(rankingSystem!= null);
                done();
            });
        });
    });

    describe("#insertCommonCriteria", function(){
        it("update criteria with common criteria", function(){
            var rankingSystem = {
                commonCriteria: [
                    {field: "race.disqualified", "comparator": "=", "value": false}
                ],
                pointAllotments: [{
                    criteria: [
                        {field: "placing", "comparator": "=", "value": "1"},
                        {field: "race.groupLevel.name", "comparator": "=", "value": "Group 3"},
                        {field: "race.distanceMeters", "comparator": "<", "value": 715}
                    ],
                    points: 20
                }]
            };
            var updatedRankingSystem = rankingService.insertCommonCriteria(rankingSystem);
            assert.deepEqual({field: "race.disqualified", "comparator": "=", "value": false}, updatedRankingSystem.pointAllotments[0].criteria[3]);
        });
    });

    after(function (done) {
        Ranking.remove({}, function(){
            RankingSystem.remove({}, function(){
                Placing.remove({}, function(){
                    testHelper.tearDown(done);
                });
            });
        });
    });
});
