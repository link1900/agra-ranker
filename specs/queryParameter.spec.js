var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
chai.should();
var expect = chai.expect;
var testHelper = require('./testHelper');

describe("Query Parameter", function(){
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        testHelper.loadQuery(function(){
            testHelper.loadQueryParameter(function(){
                testHelper.loadPointScale(function(){
                    testHelper.loadRankingSystem(done);
                })
            });
        });
    });

    describe("Get", function(){
        it("many", function(done){
            testHelper.publicSession
                .get('/queryParameter')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.length.should.be.above(0);
                    done();
                });
        });

        it("one by id", function(done){
            testHelper.publicSession
                .get('/queryParameter/53411e135c4ac1fdcd47817b')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("queryRef");
                    res.body.should.have.property("field");
                    res.body.should.have.property("comparator");
                    res.body.should.have.property("value");
                    done();
                });
        });
    });

    describe("Create", function(){
        it("is secured", function(done){
            var body = {"queryRef" : "53411dc15c4ac1fdcd478178","field":"date","comparator":"<","value": new Date()};
            testHelper.publicSession
                .post('/queryParameter')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with valid json", function(done){
            var body = {"queryRef" : "53411dc15c4ac1fdcd478178","field":"date","comparator":"<","value": "dog"};
            testHelper.authSession
                .post('/queryParameter')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("queryRef");
                    res.body.should.have.property("field");
                    res.body.should.have.property("comparator");
                    res.body.should.have.property("value");
                    res.body.queryRef.should.equal("53411dc15c4ac1fdcd478178");
                    res.body.field.should.equal("date");
                    res.body.comparator.should.equal("<");
                    res.body.value.should.equal("dog");
                    done();
                });
        });

        it("with invalid ref", function(done){
            var body = {"queryRef" : "nope","field":"date","comparator":"<","value": new Date()};
            testHelper.authSession
                .post('/queryParameter')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with no existing ref for query", function(done){
            var body = {"queryRef" : "53411dc15c4ac1fdcd478174","field":"date","comparator":"<","value": new Date()};
            testHelper.authSession
                .post('/queryParameter')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with no fields", function(done){
            var body = {};
            testHelper.authSession
                .post('/queryParameter')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with no field field", function(done){
            var body = {"queryRef" : "53411dc15c4ac1fdcd478178","comparator":"<","value": new Date()};
            testHelper.authSession
                .post('/queryParameter')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with no field comparator", function(done){
            var body = {"queryRef" : "53411dc15c4ac1fdcd478178","field":"date","value": new Date()};
            testHelper.authSession
                .post('/queryParameter')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with no value", function(done){
            var body = {"queryRef" : "53411dc15c4ac1fdcd478178","field":"date","comparator":"<"};
            testHelper.authSession
                .post('/queryParameter')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Update", function(){
        it("is secured", function(done){
            var body = {"comparator":"<"};
            testHelper.publicSession
                .put('/queryParameter/53411e135c4ac1fdcd47817b')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("comparator", function(done){
            var body = {"comparator":">"};
            testHelper.authSession
                .put('/queryParameter/53411e135c4ac1fdcd47817b')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("queryRef");
                    res.body.should.have.property("field");
                    res.body.should.have.property("comparator");
                    res.body.should.have.property("value");
                    res.body.comparator.should.equal(">");
                    done();
                });
        });

        it("bad comparator", function(done){
            var body = {"comparator":"nope"};
            testHelper.authSession
                .put('/queryParameter/53411e135c4ac1fdcd47817b')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Delete", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .del('/queryParameter/53411e135c4ac1fdcd47817b')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("existing", function (done) {
            testHelper.authSession
                .del('/queryParameter/53411e135c4ac1fdcd47817b')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    afterEach(function(done){
        testHelper.clearQuery(function(){
            testHelper.clearQueryParameter(function(){
                testHelper.clearPointScale(function(){
                    testHelper.clearRankingSystems(done);
                })
            });
        });
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
