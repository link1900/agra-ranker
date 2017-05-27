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
                    "groupLevelName":"Group 1",
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
                "groupLevelName":"Group 1",
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
                "groupLevelName":"Group 1",
                "distanceMeters": 515,
                "disqualified":false};
            raceService.updateRaceFromJson(race5, body).then(function(result){
                assert.notEqual(result, null);
                assert.equal(result.name,"raceUpdated");
                done();
            }).then(function(){}, done);
        });
    });

    describe("events", function() {
        it("should issue create event on creation", function(done){
            eventService.addListener("testCreate","Created Race", function(){
                done();
            });
            var body = {name:"raceCreated",
                date: new Date(),
                "groupLevelName":"Group 1",
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
                "groupLevelName":"Group 1",
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

        afterEach(function(){
            eventService.removeListenerByName("testCreate");
            eventService.removeListenerByName("testUpdate");
            eventService.removeListenerByName("testDelete");
        });
    });

    afterEach(function(done){
        testHelper.clearRaces(done);
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
