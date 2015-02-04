var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
var assert = chai.assert;
var Placing = require('../app/placing/placing').model;
var Greyhound = require('../app/greyhound/greyhound').model;
var Race = require('../app/race/race').model;
var placingService = null;
var testHelper = require('./testHelper');
var eventService = require('../app/event/eventService');

describe("placingService", function(){
    before(function (done) {
        testHelper.setup(function(){
            placingService = require('../app/placing/placingService');
            done();
        });
    });

    before(function(done){
        var greyhoundAllen = {
            "_id": "54a32fbee39b345cff5841b5",
            "name": "allen deed"
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
        new Race(raceShootOut).save(function(){
            new Greyhound(greyhoundAllen).save(done);
        });
    });

    describe("#createPlacing", function(done){
        it("new placing should generate an event", function(){
            var body = {"placing" : "2", "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c2147737b"};
            eventService.addListener("testPlacing","Placing", function(){
                done();
            });
            placingService.createPlacing(body);
        });

        after(function(){
            eventService.removeListenerByName("testPlacing");
        })
    });

    afterEach(function(done){
        Placing.remove({}, function(res){
            done();
        });
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
