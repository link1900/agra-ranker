var request = require('supertest');
var mongoose = require('mongoose');
var assert = require('assert');
var testHelper = require('./testHelper');
var Race = require('../app/race/race').model;
var eventService = require('../app/event/eventService');
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
                placingObjects: [
                    {"greyhoundName": "LUCY LOBSTER","placing": "1"},
                    {"greyhoundName": "JEWEL ACTION","placing": "2"},
                    {"greyhoundName": "ANYTHING LESS", "placing": "3"},
                    {"greyhoundName": "XTREME KNOCKA","placing": "4"},
                    {"greyhoundName": "COSMIC ANGEL","placing": "5"},
                    {"greyhoundName": "ALL STRUNG OUT","placing": "6"},
                    {"greyhoundName": "LA GRAND LOGIE","placing": "7"},
                    {"greyhoundName": "FRATTINI","placing": "8"}
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

    describe("events", function() {
        it("should issue create event on creation", function(done){
            eventService.addListener("testCreate","Created Race", function(){
                done();
            });
            var body = {name:"raceCreated",
                date: new Date(),
                "groupLevelRef": "531d1f72e407586c21476ef7",
                "distanceMeters": 515,
                "disqualified":false};
            raceService.createRaceFromJson(body).then(function(){}, done);
        });

        it("should issue update event on update", function(done){
            eventService.addListener("testUpdate","Updated Race", function(){
                done();
            });
            var body = {name:"raceUpdated",
                date: new Date(),
                "groupLevelRef": "531d1f72e407586c21476ef7",
                "distanceMeters": 515,
                "disqualified":false};
            raceService.updateRaceFromJson(race5, body).then(function(){}, done);
        });

        it("should issue delete event on delete", function(done){
            eventService.addListener("testDelete","Deleted Race", function(){
                done();
            });
            raceService.remove(race5).then(function(){}, done);
        });

        it("should issue create event on batch import", function(done){
            eventService.addListener("testBatch","Created Race", function(){
                done();
            });

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
            raceService.processRaceCsvRow(record).then(function(){}, done);
        });

        it("should delete race if group level is deleted", function(done){
            var event = {type: "Deleted GroupLevel", data: {entity: {"_id": "531f1f72e407586c21476ef7"}}};
            eventService.logEvent(event, true).then(function(){
                Race.find({_id: "54e7beb64751d30120fe63b5"}, function(err, res){
                    if (res.length > 0){
                        done(new Error("found races when I should not have"));
                    } else {
                        done();
                    }
                });
            });
        });

        it("should update group level flyweight of race if group level is updated", function(done){
            var event = {type: "Updated GroupLevel", data: {entity: {"_id": "531f1f72e407586c21476ef7", name: "Group 5"}}};
            eventService.logEvent(event, true).then(function(){
                Race.find({_id: "54e7beb64751d30120fe63b5"}, function(err, res){
                    if (res.length > 0){
                        assert.equal(res[0].groupLevel.name, "Group 5");
                        done();
                    } else {
                        done(new Error("no race found"));
                    }
                });
            });
        });

        afterEach(function(){
            eventService.removeListenerByName("testCreate");
            eventService.removeListenerByName("testUpdate");
            eventService.removeListenerByName("testDelete");
            eventService.removeListenerByName("testBatch");
        });
    });

    afterEach(function(done){
        testHelper.clearRaces(done);
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
