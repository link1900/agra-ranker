var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
chai.should();
var expect = chai.expect;
var assert = chai.assert;
var testHelper = require('./testHelper');

describe("Ranking", function(){
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        testHelper.loadPointAllotments(done);
    });

    describe("Get", function(){
        it("Rankings", function(done){
            testHelper.publicSession
                .get('/ranking?rankingSystemRef=53412feb5c4ac1fdcd4781ff')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){console.log(res); throw err; }
                    console.log(res.body);
                    done();
                });
        });
    });

    afterEach(function(done){
        testHelper.clearPointAllotments(done);
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
