var request = require('supertest');
var mongoose = require('mongoose');
var BatchJob = require('../app/batch/batchJob').model;
var BatchResult = require('../app/batch/batchResult').model;
var testHelper = require('./testHelper');
var assert = require('assert');

describe("BatchJob", function() {
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        BatchJob.remove({}, function(){
            new BatchJob({
                "_id" : "531d1f67e407586c21474b33",
                "name" : "batchsuccess.csv",
                "status" : "Completed",
                "type" : "file"
            }).save();
            new BatchJob({
                "_id" : "531d1f67e407586c21474b34",
                "name" : "batchAwaiting.csv",
                "status" : "Awaiting processing",
                "type" : "file"
            }).save(done);
        });
    });

    describe("Get many", function(){
        it("is secure", function (done) {
            testHelper.publicSession
                .get('/batch')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });
    });

    describe("Get one", function(){
        it("is secure", function (done) {
            testHelper.publicSession
                .get('/batch/531d1f67e407586c21474b33')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });
    });

    describe("Update", function(){
        it("is secure", function (done) {
            testHelper.publicSession
                .put('/batch/531d1f67e407586c21474b33')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("allows you to cancel a batch", function(done){
            var body = {status:'Cancelled'};
            testHelper.authSession
                .put('/batch/531d1f67e407586c21474b34')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.status, 'Cancelled');
                    done();
                });
        });

        it("cannot cancel a batch that is complete", function(done){
            var body = {status:'Cancelled'};
            testHelper.authSession
                .put('/batch/531d1f67e407586c21474b33')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Delete", function(){
        it("is secure", function (done) {
            testHelper.publicSession
                .del('/batch/531d1f67e407586c21474b33')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });
    });

    afterEach(function(done){
        BatchJob.remove({}, function(){
            BatchResult.remove({}, done);
        });
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
