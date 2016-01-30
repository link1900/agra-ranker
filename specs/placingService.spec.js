var Placing = require('../app/placing/placing').model;
var Greyhound = require('../app/greyhound/greyhound').model;
var Race = require('../app/race/race').model;
var placingService = null;
var testHelper = require('./testHelper');
var eventService = require('../app/event/eventService');

var placingOne;
describe("placingService", function(){
    before(function (done) {
        testHelper.setup(function(){
            placingService = require('../app/placing/placingService');
            done();
        });
    });

    beforeEach(function(done){
        var greyhoundAllen = {
            "_id": "54a32fbee39b345cff5841b5",
            "name": "allen deed"
        };

        var greyhoundBob = {
            "_id": "54e905574751d30120fe63b7",
            "name": "bob"
        };

        var raceShootOut = {
            "_id": "54a32fc7e39b345cff5857d1",
            "distanceMeters": 500,
            "groupLevelName": "Group 2",
            "name": "SHOOT OUT",
            "disqualified": false
        };

        placingOne = new Placing({_id: "54e905804751d30120fe63b9", "placing" : "5", "raceRef": "54a32fc7e39b345cff5857d1", "greyhoundRef":"54e905574751d30120fe63b7"});
        new Race(raceShootOut).save(function(){
            new Greyhound(greyhoundAllen).save(function(){
                new Greyhound(greyhoundBob).save(function() {
                    placingOne.save(function () {
                        done();
                    });
                });
            });
        });
    });

    describe("#createPlacing", function(){
        it("should fail if missing greyhound ref", function(done){
            var body = {"placing" : "2", "raceRef": "531d1f72e407586c21476ea8"};
            placingService.createPlacing(body).then(function(){
                done(new Error("I should not be called"));
            }, function(){done()});
        });

        it("should fail if missing greyhound ref", function(done){
            var body = {"placing" : "2", "greyhoundRef":"54a32fbee39b345cff5841b5"};
            placingService.createPlacing(body).then(function(){
                done(new Error("I should not be called"));
            }, function(){done()});
        });

        it("new placing should generate an event", function(done){
            var body = {"placing" : "2", "raceRef": "54a32fc7e39b345cff5857d1", "greyhoundRef":"54a32fbee39b345cff5841b5"};
            eventService.addListener("testCreatePlacing","Created Placing", function(){
                done();
            });
            placingService.createPlacing(body).then(function(){}, done);
        });

        after(function(){
            eventService.removeListenerByName("testCreatePlacing");
        });
    });

    describe("#updatePlacing", function(){
        it("should generate an event", function(done){
            var body = {"placing" : "6"};
            eventService.addListener("testUpdatePlacing","Updated Placing", function(){
                done();
            });
            placingService.updatePlacing(placingOne, body).then(function(){}, done);
        });

        after(function(){
            eventService.removeListenerByName("testUpdatePlacing");
        });
    });

    describe("#remove", function(){
        it("should generate an event", function(done){
            eventService.addListener("testDeletePlacing","Deleted Placing", function(){
                done();
            });
            placingService.remove(placingOne).then(function(){}, done);
        });

        after(function(){
            eventService.removeListenerByName("testDeletePlacing");
        });
    });

    describe("listeners", function(){
        it("should delete placing on greyhound delete", function(done){
            var event = {type: "Deleted Greyhound", data: {entity: {"_id": "54e905574751d30120fe63b7"}}};
            eventService.logEvent(event, true).then(function(){
                Placing.find({_id: placingOne._id}, function(err, res){
                    if (res.length > 0){
                        done(new Error("found placings when I should not have"));
                    } else {
                        done();
                    }
                });
            });
        });

        it("should delete placing on race delete", function(done){
            var event = {type: "Deleted Race", data: {entity: {"_id": "54a32fc7e39b345cff5857d1"}}};
            eventService.logEvent(event, true).then(function(){
                Placing.find({_id: placingOne._id}, function(err, res){
                    if (res.length > 0){
                        done(new Error("found placings when I should not have"));
                    } else {
                        done();
                    }
                });
            });
        });
    });

    afterEach(function(done){
        Placing.remove({}, function(){
            done();
        });
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
