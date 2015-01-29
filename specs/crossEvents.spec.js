var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
var assert = chai.assert;
var testHelper = require('./testHelper');
var eventService = require('../app/event/eventService');

describe("CrossEvents", function(){
    before(function (done) {
        testHelper.setup(done);
    });

    describe("Check placing crud issues events", function(){

        it("with complete placing", function(done){
            var body = {"placing" : "5", "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c214773df"};
            eventService.addListener('.*', function(event){

            });
            testHelper.authSession
                .post('/placing')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }

                    assert.
                    done();
                });
        });
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
