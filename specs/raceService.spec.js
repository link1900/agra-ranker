var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
var assert = chai.assert;
var testHelper = require('./testHelper');
var raceService = null;

describe("raceService", function(){
    before(function (done) {
        testHelper.setup(function(){
            raceService = require('../app/race/raceService');
            done();
        });
    });

    beforeEach(function(done){
        testHelper.loadRaces(function(){
            testHelper.loadGreyhounds(done);
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
