var request = require('supertest');
var mongoose = require('mongoose');
var Batch = mongoose.model('Batch');
var BatchRecord = mongoose.model('BatchRecord');
var testHelper = require('./testHelper');

describe("Batch", function() {
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        Batch.remove({}, function(){
            new Batch({
                "_id" : "531d1f67e407586c21474b33",
                "failureCount" : 0,
                "name" : "batchsuccess.csv",
                "status" : "Completed",
                "successCount" : 3,
                "type" : "file"
            }).save();
            new Batch({
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

    describe("Run", function(){
        it("is secure", function (done) {
            testHelper.publicSession
                .put('/batch/531d1f67e407586c21474b33/run')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });
    });

    describe("Create", function(){
        it("is secure", function (done) {
            testHelper.publicSession
                .post('/upload/batch')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });
    });

    afterEach(function(done){
        Batch.remove({}, function(){
            BatchRecord.remove({}, done);
        });
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
