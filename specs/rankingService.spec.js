var request = require('supertest');
var mongoose = require('mongoose');
var _ = require('lodash');
var chai = require('chai');
var assert = chai.assert;
var testHelper = require('./testHelper');
var Placing = require('../app/placing/placing').model;
var Greyhound = require('../app/greyhound/greyhound').model;
var BatchJob = require('../app/batch/batchJob').model;
var Race = require('../app/race/race').model;
var RankingSystem = require('../app/ranking/rankingSystem').model;
var Ranking = require('../app/ranking/ranking').model;
var rankingService = null;
var eventService = require('../app/event/eventService');

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
                    assert.isNotNull(rankings);
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
                assert.isNotNull(rsc.commonCriteria[1]);
                assert.isNotNull(rsc.commonCriteria[2]);
                assert.isNotNull(rsc.pointAllotments[0].criteria[3]);
                assert.isNotNull(rsc.pointAllotments[0].criteria[4]);
                assert.isNotNull(rsc.pointAllotments[0].criteria[5]);
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
            assert.isNotNull(updatedRankingSystem.commonCriteria[1]);
            assert.isNotNull(updatedRankingSystem.commonCriteria[2]);
        });
    });

    describe("#getRankingSystem", function(){
        it("find a ranking system or get the default", function(done){
            rankingService.getRankingSystem("54ac8b031ee51022d545c8fc").then(function(rankingSystem){
                assert.isNotNull(rankingSystem);
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

    describe("#sumPlacingsIntoRankings", function(){
        var greyhoundAllen = {
            "_id": "54a32fbee39b345cff5841b5",
            "name": "allen deed"
        };

        var greyhoundBob = {
            "_id": "54a32fbee39b345cff5841b6",
            "name": "bob"
        };

        var raceShootOut = {
            "_id": "54a32fc7e39b345cff5857d1",
            "distanceMeters": 500,
            "groupLevel": {
                "name": "Group 2",
                "_id": "547db17c81beea000004f398"
            },
            "groupLevelRef": "547db17c81beea000004f398",
            "name": "SHOOT OUT",
            "disqualified": false
        };

        var placingAllenShootOut = {
            "_id": "54a32fc7e39b345cff5857d3",
            "greyhound": greyhoundAllen,
            "race": raceShootOut,
            "placing": "7",
            "raceRef": raceShootOut._id,
            "greyhoundRef": greyhoundAllen._id
        };

        var placingBobShootOut = {
            "_id": "54a32fc7e39b345cff5857d4",
            "greyhound": greyhoundBob,
            "race": raceShootOut,
            "placing": "5",
            "raceRef": raceShootOut._id,
            "greyhoundRef": greyhoundBob._id
        };

        var placingPointOne = {
            points: 10,
            placing: placingAllenShootOut
        };

        var placingRef1 = {
            "placingRef": "54a32fc7e39b345cff5857d3",
            "points": 10,
            "position": "7",
            "raceName": "SHOOT OUT"
        };

        var placingRef2 = {
            "placingRef": "54a32fc7e39b345cff5857d4",
            "points": 10,
            "position": "5",
            "raceName": "SHOOT OUT"
        };

        var placingPointTwo = {
            points: 10,
            placing: placingAllenShootOut
        };

        var placingPointThree = {
            points: 10,
            placing: placingAllenShootOut
        };

        var placingPoint4 = {
            points: 10,
            placing: placingBobShootOut
        };

        var placingPoint5 = {
            points: 10,
            placing: placingBobShootOut
        };

        it("should sum placings points into totals", function(){
            var placingPoints = [placingPointOne, placingPointTwo, placingPointThree, placingPoint4, placingPoint5];
            var expectedRankings = [{
                greyhoundRef: greyhoundAllen._id,
                greyhoundName: greyhoundAllen.name,
                placingPoints: [placingRef1,placingRef1,placingRef1],
                totalPoints : 30
            },{
                greyhoundRef: greyhoundBob._id,
                greyhoundName: greyhoundBob.name,
                placingPoints: [placingRef2, placingRef2],
                totalPoints : 20
            }];
            var results = rankingService.sumPlacingsIntoRankings(placingPoints, true);
            assert.deepEqual(results,expectedRankings);
        });

        it("should return empty when given no placings", function(){
            var results = rankingService.sumPlacingsIntoRankings([]);
            assert.deepEqual(results,[]);
        });
    });

    describe("#addRankingPosition", function(){
        it("add rank correctly", function(){
            var someRankings = [{totalPoints : 5},{totalPoints : 10},{totalPoints : 10},{totalPoints : 30},{totalPoints : 20}];
            var expectedRankings = [{rank :1, totalPoints : 30},{rank: 2, totalPoints : 20},{rank: 3, totalPoints : 10},{rank: 3, totalPoints : 10},{rank: 4, totalPoints : 5}];
            var results = rankingService.addRankingPosition(someRankings);
            assert.deepEqual(results,expectedRankings);
        });
    });

    describe("converting ranking system into placings", function() {
        var placing1 = {
            "placing" : "5",
            "raceRef": "531d1f72e407586c21476ea8",
            "race": {
                "name" : "race1",
                "date": new Date(),
                "groupLevelRef":"531d1f72e407586c21476ef7",
                "groupLevel" : {"name" : "Group 1", "level":1},
                "distanceMeters": 515,
                "disqualified":false},
            "greyhoundRef":"531d1f74e407586c2147737b"
        };

        var placing2 = {
            "placing" : "5",
            "raceRef": "531d1f72e407586c21476ea9",
            "race": {
                "name" : "race2",
                "date": new Date(),
                "groupLevelRef":"531d1f72e407586c21476ef7",
                "groupLevel" : {"name" : "Group 1", "level":1},
                "distanceMeters": 515,
                "disqualified":false},
            "greyhoundRef":"531d1f74e407586c2147737b"
        };

        var placing3 = {
            "placing" : "5",
            "raceRef": "531d1f72e408586c21476ea8",
            "race": {
                "name" : "race1",
                "date": new Date(),
                "groupLevelRef":"531d1f72e407586c21476ef7",
                "groupLevel" : {"name" : "Group 2", "level":1},
                "distanceMeters": 515,
                "disqualified":false},
            "greyhoundRef":"531d1f74e407586c2147737b"
        };

        before(function(done){
            new Placing(placing1).save(function(){
                new Placing(placing2).save(function(){
                    new Placing(placing3).save(function(){
                        done();
                    });
                });
            });
        });

        after(function (done) {
            RankingSystem.remove({}, function(){
                Placing.remove({}, function(){
                    done();
                });
            });
        });

        it("converts single set of criteria into placings", function (done) {
            var pointAllotment = {
                criteria: [
                    {field: "placing", "comparator": "=", "value": "5"},
                    {field: "race.groupLevel.name", "comparator": "=", "value": "Group 1"},
                    {field: "race.distanceMeters", "comparator": "<", "value": 715},
                    {field: "race.disqualified", "comparator": "=", "value": false}
                ],
                points: 10
            };

            rankingService.convertPointAllotmentToPlacingsPoints(pointAllotment).then(function(results){
                assert.lengthOf(results, 2);
                assert.equal(results[0].points, 10);
                assert.equal(results[1].points, 10);
                done();
            },done).catch(function(err){
                done(err);
            });
        });

        it("convert many criteria sets into placings", function (done) {
            var pointAllotments = [{
                criteria: [
                    {field: "placing", "comparator": "=", "value": "5"},
                    {field: "race.groupLevel.name", "comparator": "=", "value": "Group 1"},
                    {field: "race.distanceMeters", "comparator": "<", "value": 715},
                    {field: "race.disqualified", "comparator": "=", "value": false}
                ],
                points: 10
            },{
                criteria: [
                    {field: "placing", "comparator": "=", "value": "5"},
                    {field: "race.groupLevel.name", "comparator": "=", "value": "Group 2"},
                    {field: "race.distanceMeters", "comparator": "<", "value": 715},
                    {field: "race.disqualified", "comparator": "=", "value": false}
                ],
                points: 5
            }];

            rankingService.convertPointAllotmentsToPlacingsPoints(pointAllotments).then(function(results){
                assert.lengthOf(results, 3);
                assert.equal(results[0].points, 10);
                assert.equal(results[1].points, 10);
                assert.equal(results[2].points, 5);
                done();
            },done).catch(function(err){
                done(err);
            });
        });
    });

    describe("#calculateRankings", function() {
        before(function(done){
            testHelper.setupRankingTestData(done);
        });

        after(function (done) {
            testHelper.removeRankingData(done);
        });

        it("calculates the correct rankings", function (done) {
            rankingService.calculateRankings(new Date(2010,1,1), new Date(2015,1,1), "54ac8b031ee51022d545c8fc").then(function(results){
                assert.lengthOf(results, 4);
                assert.equal(results[0].greyhoundName, "john");
                assert.equal(results[0].rank, 1);
                assert.equal(results[0].totalPoints, 60);
                assert.equal(results[1].rank, 2);
                assert.equal(results[1].totalPoints, 10);
                assert.equal(results[2].rank, 2);
                assert.equal(results[2].totalPoints, 10);
                assert.equal(results[3].rank, 3);
                assert.equal(results[3].totalPoints, 5);
                done();
            },done).catch(function(err){
                done(err);
            });
        });

        it("calculates the correct rankings for the time period", function (done) {
            rankingService.calculateRankings(new Date(2011,1,1), new Date(2012,11,11), "54ac8b031ee51022d545c8fc").then(function(results){
                assert.equal(1, results.length);
                assert.equal(results[0].greyhoundName, "john");
                assert.equal(results[0].rank, 1);
                assert.equal(20, results[0].totalPoints);
                done();
            },done).catch(function(err){
                done(err);
            });
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
