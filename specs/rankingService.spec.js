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
var rankingService = null;
var eventService = require('../app/event/eventService');

describe("rankingService", function(){

    before(function (done) {
        testHelper.setup(function(){
            Placing.remove({}, function(){
                rankingService = require('../app/ranking/rankingService');
                done();
            });
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
        RankingSystem.remove({}, function(){
            Placing.remove({}, function(){
                testHelper.tearDown(done);
            });
        })
    });
});
