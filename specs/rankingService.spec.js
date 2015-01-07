var request = require('supertest');
var mongoose = require('mongoose');
var _ = require('lodash');
var chai = require('chai');
var assert = chai.assert;
var testHelper = require('./testHelper');
var Placing = require('../app/placing/placing').model;
var RankingSystem = require('../app/ranking/rankingSystem').model;
var rankingService = null;

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
            "race": {
                "name": "SHOOT OUT"
            }
        };

        var placingRef2 = {
            "placingRef": "54a32fc7e39b345cff5857d4",
            "points": 10,
            "position": "5",
            "race": {
                "name": "SHOOT OUT"
            }
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
            var results = rankingService.sumPlacingsIntoRankings(placingPoints);
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

    describe("#getFinancialYearForDate", function() {
        it("get correct financial year (13-14) for start of 2014", function(done){
            var date = new Date(2014, 3, 3);
            var result = rankingService.getFinancialYearForDate(date);
            assert.property(result,'start');
            assert.property(result,'end');
            assert(_.isDate(result.start));
            assert(_.isDate(result.end));
            assert.equal(result.start.getFullYear(), 2013);
            assert.equal(result.start.getMonth(), 7);
            assert.equal(result.start.getDate(), 1);
            assert.equal(result.start.getHours(), 0);
            //check end date is 31 of June
            assert.equal(result.end.getFullYear(), 2014);
            assert.equal(result.end.getMonth(), 6);
            assert.equal(result.end.getDate(), 31);
            assert.equal(result.end.getHours(), 23);
            done();
        });

        it("get correct financial year (14-15) for end of 2014", function(done){
            var date = new Date(2014, 8, 8);
            var result = rankingService.getFinancialYearForDate(date);
            assert.property(result,'start');
            assert.property(result,'end');
            assert(_.isDate(result.start));
            assert(_.isDate(result.end));
            assert.equal(result.start.getFullYear(), 2014);
            assert.equal(result.start.getMonth(), 7);
            assert.equal(result.start.getDate(), 1);
            assert.equal(result.start.getHours(), 0);
            //check end date is 31 of June
            assert.equal(result.end.getFullYear(), 2015);
            assert.equal(result.end.getMonth(), 6);
            assert.equal(result.end.getDate(), 31);
            assert.equal(result.end.getHours(), 23);
            done();
        });
    });

    describe("#getQueryForPointAllotment", function() {
        it('should generate the correct query for criteria', function(){
            var pointAllotment ={
                criteria: [
                    {field: "placing", "comparator": "=", "value": "1"},
                    {field: "someField", "comparator": ">=", "value": "55"},
                    {field: "beforeMe", "comparator": "<=", "value":22},
                    {field: "race.groupLevel.name", "comparator": "=", "value": "Group 1"},
                    {field: "distanceMeters", "comparator": "<", "value": "715"},
                    {field: "distanceMeters", "comparator": ">", "value": "515"},
                    {field: "disqualified", "comparator": "!=", "value": true}
                ],
                points: 70
            };
            var expectedQuery = {
                'placing': '1',
                'race.groupLevel.name': 'Group 1',
                'someField': { '$gte': "55"},
                'beforeMe': { '$lte': 22},
                'distanceMeters': { '$lt': '715', '$gt': '515' },
                'disqualified': { '$ne' : true }
            };

            var generatedQuery = rankingService.getQueryForPointAllotment(pointAllotment);
            assert.deepEqual(generatedQuery, expectedQuery);
        });
    });

    describe("#convertPlaceHolder", function() {
        it("get correct date for place holder ##currentFinancialYear.start", function(done){
            var result = rankingService.convertPlaceHolder('##currentFinancialYear.start');
            assert(_.isDate(result));
            done();
        });

        it("get correct date for place holder ##currentFinancialYear.end", function(done){
            var result = rankingService.convertPlaceHolder('##currentFinancialYear.end');
            assert(_.isDate(result));
            done();
        });

        it("get back the value when not a placeholder", function(done){
            var result = rankingService.convertPlaceHolder('not place holder');
            assert.equal(result, 'not place holder');
            done();
        });
    });

    describe("#convertPlaceHolder", function() {
        it("get correct date for place holder ##currentFinancialYear.start", function(done){
            var result = rankingService.convertPlaceHolder('##currentFinancialYear.start');
            assert(_.isDate(result));
            done();
        });

        it("get correct date for place holder ##currentFinancialYear.end", function(done){
            var result = rankingService.convertPlaceHolder('##currentFinancialYear.end');
            assert(_.isDate(result));
            done();
        });

        it("get back the value when not a placeholder", function(done){
            var result = rankingService.convertPlaceHolder('not place holder');
            assert.equal(result, 'not place holder');
            done();
        });
    });

    describe("#insertDatesIntoPointAllotments", function() {
        var someRankingSystem = {
            "name": "Test ranking system",
            "description": "Test ranking system",
            equalPositionResolution: "splitPoints",
            pointAllotments: [{
                criteria: [
                    {field: "placing", "comparator": "=", "value": "1"},
                    {field: "race.groupLevel.name", "comparator": "=", "value": "Group 3"},
                    {field: "race.distanceMeters", "comparator": "<", "value": 715},
                    {field: "race.disqualified", "comparator": "=", "value": false}
                ],
                points: 20
            },{
                criteria: [
                    {field: "placing", "comparator": "=", "value": "2"},
                    {field: "race.groupLevel.name", "comparator": "=", "value": "Group 3"},
                    {field: "race.distanceMeters", "comparator": "<", "value": 715},
                    {field: "race.disqualified", "comparator": "=", "value": false}
                ],
                points: 10
            },{
                criteria: [
                    {field: "placing", "comparator": "=", "value": "3"},
                    {field: "race.groupLevel.name", "comparator": "=", "value": "Group 3"},
                    {field: "race.distanceMeters", "comparator": "<", "value": 715},
                    {field: "race.disqualified", "comparator": "=", "value": false}
                ],
                points: 5
            }]
        };

        it("inserts two dates", function(done){
            var startDate = new Date(2011, 1,1);
            rankingService.insertDatesIntoPointAllotments(someRankingSystem, startDate, new Date(2013, 1,1));
            assert.lengthOf(someRankingSystem.pointAllotments[0].criteria, 6);
            assert.deepEqual(someRankingSystem.pointAllotments[0].criteria[4], {
                "field": "race.date",
                "comparator": ">=",
                "value": startDate
            });
            done();
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

        var rankingSystem1 = {
            _id: "54ac8b031ee51022d545c8fc",
            "name": "Test ranking system",
            "description": "Test ranking system",
            equalPositionResolution: "splitPoints",
            pointAllotments: [{
                criteria: [
                    {field: "placing", "comparator": "=", "value": "1"},
                    {field: "race.groupLevel.name", "comparator": "=", "value": "Group 3"},
                    {field: "race.distanceMeters", "comparator": "<", "value": 715},
                    {field: "race.disqualified", "comparator": "=", "value": false}
                ],
                points: 20
            },{
                criteria: [
                    {field: "placing", "comparator": "=", "value": "2"},
                    {field: "race.groupLevel.name", "comparator": "=", "value": "Group 3"},
                    {field: "race.distanceMeters", "comparator": "<", "value": 715},
                    {field: "race.disqualified", "comparator": "=", "value": false}
                ],
                points: 10
            },{
                criteria: [
                    {field: "placing", "comparator": "=", "value": "3"},
                    {field: "race.groupLevel.name", "comparator": "=", "value": "Group 3"},
                    {field: "race.distanceMeters", "comparator": "<", "value": 715},
                    {field: "race.disqualified", "comparator": "=", "value": false}
                ],
                points: 5
            }]
        };

        var john = {
            _id: '54ac8d5e1ee51022d545c8fe',
            name: "john"
        };
        var sally = {
            _id: '54ac8da71ee51022d545c900',
            name: "sally"
        };
        var molly = {
            _id: '54ac8dac1ee51022d545c901',
            name: "molly"
        };
        var jane = {
            _id: '54ac8db01ee51022d545c902',
            name: "jane"
        };

        var rankingRace1 = {
            "_id": "54ac8e011ee51022d545c904",
            "distanceMeters": 500,
            "groupLevel": {
                "name": "Group 3",
                "_id": "54ac8dce1ee51022d545c903"
            },
            "groupLevelRef": "54ac8dce1ee51022d545c903",
            "name": "rankingRace1",
            date: new Date(2014,8,8),
            "disqualified": false
        };
        var rankingRace2 = {
            "_id": "54ac8e1a1ee51022d545c905",
            "distanceMeters": 500,
            "groupLevel": {
                "name": "Group 3",
                "_id": "54ac8dce1ee51022d545c903"
            },
            "groupLevelRef": "54ac8dce1ee51022d545c903",
            "name": "rankingRace1",
            date: new Date(2014,8,8),
            "disqualified": false
        };
        var rankingRace3 = {
            "_id": "54ac8e221ee51022d545c906",
            "distanceMeters": 500,
            "groupLevel": {
                "name": "Group 3",
                "_id": "54ac8dce1ee51022d545c903"
            },
            "groupLevelRef": "54ac8dce1ee51022d545c903",
            "name": "rankingRace1",
            date: new Date(2012,8,8),
            "disqualified": false
        };

        var johnRankingRace1 = {
            "greyhound": john,
            "race": rankingRace1,
            "placing": "1",
            _id:"54aca1da1ee51022d545c909",
            "raceRef": rankingRace1._id,
            "greyhoundRef": john._id
        };

        var johnRankingRace1Ref = {
            "placingRef": "54aca1da1ee51022d545c909",
            "points": 20,
            "position": "1",
            "race": {
                "name": rankingRace1.name
            }
        };

        var sallyRankingRace1 = {
            "greyhound": sally,
            "race": rankingRace1,
            "placing": "2",
            _id:"54aca2661ee51022d545c90a",
            "raceRef": rankingRace1._id,
            "greyhoundRef": sally._id
        };

        var sallyRankingRace1Ref = {
            "placingRef": "54aca2661ee51022d545c90a",
            "points": 10,
            "position": "2",
            "race": {
                "name": rankingRace1.name
            }
        };

        var mollyRankingRace1 = {
            "greyhound": molly,
            "race": rankingRace1,
            _id:"54aca2721ee51022d545c90b",
            "placing": "3",
            "raceRef": rankingRace1._id,
            "greyhoundRef": molly._id
        };

        var mollyRankingRace1Ref = {
            "placingRef": "54aca2721ee51022d545c90b",
            "points": 5,
            "position": "3",
            "race": {
                "name": rankingRace1.name
            }
        };

        var johnRankingRace2 = {
            "greyhound": john,
            "race": rankingRace2,
            _id:"54aca27e1ee51022d545c90c",
            "placing": "1",
            "raceRef": rankingRace2._id,
            "greyhoundRef": john._id
        };

        var johnRankingRace2Ref = {
            "placingRef": "54aca27e1ee51022d545c90c",
            "points": 20,
            "position": "1",
            "race": {
                "name": rankingRace2.name
            }
        };

        var janeRankingRace2 = {
            "greyhound": jane,
            "race": rankingRace2,
            _id:"54aca28f1ee51022d545c90d",
            "placing": "2",
            "raceRef": rankingRace2._id,
            "greyhoundRef": jane._id
        };

        var janeRankingRace2Ref = {
            "placingRef": "54aca28f1ee51022d545c90d",
            "points": 10,
            "position": "2",
            "race": {
                "name": rankingRace2.name
            }
        };

        var johnRankingRace3 = {
            "greyhound": john,
            "race": rankingRace3,
            _id:"54aca29d1ee51022d545c90e",
            "placing": "1",
            "raceRef": rankingRace3._id,
            "greyhoundRef": john._id
        };

        var johnRankingRace3Ref = {
            "placingRef": "54aca29d1ee51022d545c90e",
            "points": 20,
            "position": "1",
            "race": {
                "name": rankingRace3.name
            }
        };

        before(function(done){
            new Placing(johnRankingRace1).save(function(){
                new Placing(sallyRankingRace1).save(function(){
                    new Placing(mollyRankingRace1).save(function(){
                        new Placing(janeRankingRace2).save(function(){
                            new Placing(johnRankingRace2).save(function(){
                                new Placing(johnRankingRace3).save(function(){
                                    new RankingSystem(rankingSystem1).save(function(){
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        after(function (done) {
            RankingSystem.remove({}, function(){
                Placing.remove({}, function(){
                    done();
                });
            })
        });

        it("calculates the correct rankings", function (done) {
            rankingService.calculateRankings("54ac8b031ee51022d545c8fc").then(function(results){
                assert.lengthOf(results, 4);
                assert.equal(results[0].greyhoundName, john.name);
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

        it("calculates with limit", function (done) {
            rankingService.calculateRankings("54ac8b031ee51022d545c8fc", new Date(2013, 1,1) ,null, 1).then(function(results){
                assert.lengthOf(results, 1);
                assert.equal(results[0].greyhoundName, john.name);
                assert.equal(results[0].rank, 1);
                assert.equal(results[0].totalPoints, 40);
                done();
            },done).catch(function(err){
                done(err);
            });
        });

        it("calculates with limit", function (done) {
            rankingService.calculateRankings("54ac8b031ee51022d545c8fc", new Date(2013,1,1), null, 1).then(function(results){
                assert.lengthOf(results, 1);
                assert.equal(results[0].greyhoundName, john.name);
                assert.equal(results[0].rank, 1);
                assert.equal(results[0].totalPoints, 40);
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
