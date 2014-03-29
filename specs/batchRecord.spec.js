var request = require('supertest');
var mongoose = require('mongoose');
var Batch = mongoose.model('Batch');
var BatchRecord = mongoose.model('BatchRecord');
var testHelper = require('./testHelper');

describe("BatchRecord", function() {
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        BatchRecord.remove({}, function(){
            new BatchRecord({
                "_id" : "531d1f68e407586c2147532a",
                "batchRef" : "531d1f67e407586c21474b33",
                "rawData" : [
                    "GREYBATCH1",
                    "GREYBATCH1SIRE",
                    "GREYBATCH1DAM"
                ],
                "recordNumber" : 1,
                "resultRef" : "531d1f69e407586c21475907",
                "status" : "Success",
                "type" : "file"
            }).save(done);
        });
    });

    describe("Get many", function(){
        it("is secure", function (done) {
            testHelper.publicSession
                .get('/batchRecord')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
