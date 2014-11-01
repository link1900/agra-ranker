var request = require('supertest');
var mongoose = require('mongoose');
var BatchJob = require('../app/batch/batchJob').model;
var BatchResult = require('../app/batch/batchResult').model;
var testHelper = require('./testHelper');

describe("BatchResult", function() {
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        BatchResult.remove({}, function(){
            new BatchResult({
                "_id" : "531d1f68e407586c2147532a",
                "batchRef" : "531d1f67e407586c21474b33",
                "recordNumber" : 1,
                "status" : "Success"
            }).save(done);
        });
    });

    describe("Get many", function(){
        it("is secure", function (done) {
            testHelper.publicSession
                .get('/batchResult')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
