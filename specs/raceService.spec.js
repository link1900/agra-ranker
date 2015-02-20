var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
var assert = require('assert');
var testHelper = require('./testHelper');
var Race = require('../app/race/race').model;
var raceService = null;


var race5;
describe("raceService", function(){
    before(function (done) {
        testHelper.setup(function(){
            raceService = require('../app/race/raceService');
            done();
        });
    });

    beforeEach(function(done){
        testHelper.loadRaces(function(){
            testHelper.loadGreyhounds(function(){
                race5 = new Race({"_id" : "54e7beb64751d30120fe63b5",
                    "name" : "race5",
                    "date": new Date(),
                    "groupLevelRef":"531f1f72e407586c21476ef7",
                    "groupLevel" : {"name" : "Group 1", "level":1},
                    "distanceMeters": 515,
                    "disqualified":false});
                race5.save(function(){
                    done();
                });
            });
        });
    });

    describe('#createRaceFromJson', function(){
        it("should create a race", function(done){
            var body = {name:"raceCreated",
                date: new Date(),
                "groupLevelRef": "531d1f72e407586c21476ef7",
                "distanceMeters": 515,
                "disqualified":false};
            raceService.createRaceFromJson(body).then(function(result){
                assert.notEqual(result, null);
                assert.equal(result.name,"raceCreated");
                done();
            }).then(function(){}, done);
        });
    });

    describe('#updateRaceFromJson', function(){
        it("should update a race", function(done){
            var body = {name:"raceUpdated",
                date: new Date(),
                "groupLevelRef": "531d1f72e407586c21476ef7",
                "distanceMeters": 515,
                "disqualified":false};
            raceService.updateRaceFromJson(race5, body).then(function(result){
                assert.notEqual(result, null);
                assert.equal(result.name,"raceUpdated");
                done();
            }).then(function(){}, done);
        });
    });

    describe("#rawCsvArrayToRaceText", function(){
        it("should return a race object", function(){
            var raceRow = ["VIC PETERS CLASSIC","1/11/2014 12:00:00 AM","Group 1","Sprint","LUCY LOBSTER","1","JEWEL ACTION","2","ANYTHING LESS","3","XTREME KNOCKA","4","COSMIC ANGEL","5","ALL STRUNG OUT","6","LA GRAND LOGIE","7","FRATTINI","8"];
            var expectedRace = {
                name : "VIC PETERS CLASSIC",
                dateText: "1/11/2014 12:00:00 AM",
                groupText: "Group 1",
                lengthText: "Sprint",
                placingText: [
                    {"greyhoundName": "lucy lobster","placing": "1"},
                    {"greyhoundName": "jewel action","placing": "2"},
                    {"greyhoundName": "anything less", "placing": "3"},
                    {"greyhoundName": "xtreme knocka","placing": "4"},
                    {"greyhoundName": "cosmic angel","placing": "5"},
                    {"greyhoundName": "all strung out","placing": "6"},
                    {"greyhoundName": "la grand logie","placing": "7"},
                    {"greyhoundName": "frattini","placing": "8"}
                ]
            };
            var raceResult = raceService.rawCsvArrayToRaceText(raceRow);
            assert.deepEqual(raceResult, expectedRace);
        });
    });

    describe("#processRaceCsvRow", function(){
        it("should create a race and placings", function(done){
            var record =
            ["VIC PETERS CLASSIC",
                "1/11/2014 12:00:00 AM",
                "Group 1",
                "Sprint",
                "LUCY LOBSTER", "1",
                "JEWEL ACTION", "2",
                "ANYTHING LESS", "3",
                "XTREME KNOCKA",  "4",
                "COSMIC ANGEL", "5",
                "ALL STRUNG OUT","6",
                "LA GRAND LOGIE","7",
                "FRATTINI","8"
            ];
            raceService.processRaceCsvRow(record).then(function(result){
                if (result.isSuccessful){
                    done();
                } else {
                    done(result.stepResults);
                }
            }, function(error){
                done(error);
            });
        });
    });

    afterEach(function(done){
        testHelper.clearRaces(done);
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
