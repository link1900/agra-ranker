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

    describe("Get", function(){

        before(function(done){
            testHelper.setupRankingTestData(done);
        });

        after(function (done) {
            testHelper.removeRankingData(done);
        });

        //it("Rankings", function(done){
        //    testHelper.publicSession
        //        .get('/ranking?rankingSystemRef=54ac8b031ee51022d545c8fc')
        //        .set('Accept', 'application/json')
        //        .expect('Content-Type', /json/)
        //        .expect(200)
        //        .end(function(err, res){
        //            if (err){console.log(res.body); throw err; }
        //            assert.lengthOf(res.body, 4);
        //            done();
        //        });
        //});
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
