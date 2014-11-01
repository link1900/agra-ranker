var request = require('supertest');
var mongoose = require('mongoose');
var BatchJob = require('../app/batch/batchJob').model;
var BatchResult = require('../app/batch/batchResult').model;
var testHelper = require('./testHelper');

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

    describe("Create", function(){
        it("is secure", function (done) {
            testHelper.publicSession
                .post('/upload/batch/greyhound/csv')
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
