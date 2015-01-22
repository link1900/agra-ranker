var request = require('supertest');
var mongoose = require('mongoose');
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

    describe("#logEvent", function() {
        it("gets to a listener", function(done){
            eventService.addListener(/test/, function(){
                done();
            });
            eventService.logEvent({"type":"test_event"});
        });

    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
