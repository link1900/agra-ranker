var request = require('supertest');
var mongoose = require('mongoose');
var q = require('q');
var _ = require('lodash');
var chai = require('chai');
var assert = chai.assert;
var testHelper = require('./testHelper');
var eventService = null;

describe("eventService", function(){

    before(function (done) {
        testHelper.setup(function(){
            eventService = require('../app/event/eventService');
            done();
        });
    });

    it("gets to a listener", function(done){
        eventService.addListener("test1", function(){
            done();
        });
        eventService.logEvent({"type":"test1"});
    });

    it("will return a promise when requiring confirmation", function(done){
        var reached = false;
        eventService.addListener("test2", function(){
            reached = true;
            return q(true);
        });
        eventService.logEvent({"type":"test2"}, true).then(function(){
            if (reached === true){
                done();
            } else {
                done("didn't reach the listener");
            }

        });
    });

    after(function (done) {
        eventService.removeListener("test1");
        eventService.removeListener("test2");
        testHelper.tearDown(done);
    });
});
