var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
chai.should();
var expect = chai.expect;
var testHelper = require('./testHelper');

describe("Query", function(){
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
                .get('/query')
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
                .get('/query/53411dc15c4ac1fdcd478178')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("rankingSystemRef");
                    res.body.should.have.property("pointScaleRef");
                    done();
                });
        });
    });

    describe("Create", function(){
        it("is secured", function(done){
            var body = {"rankingSystemRef":"53411feb5c4ac1fdcd47817d", "pointScaleRef" : "53411de55c4ac1fdcd47817a"};
            testHelper.publicSession
                .post('/query')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with valid json", function(done){
            var body = {"rankingSystemRef":"53411feb5c4ac1fdcd47817d", "pointScaleRef" : "53411de55c4ac1fdcd47817a"};
            testHelper.authSession
                .post('/query')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("rankingSystemRef");
                    res.body.should.have.property("pointScaleRef");
                    res.body.rankingSystemRef.should.equal("53411feb5c4ac1fdcd47817d");
                    res.body.pointScaleRef.should.equal("53411de55c4ac1fdcd47817a");
                    done();
                });
        });

        it("with invalid ref", function(done){
            var body = {"rankingSystemRef":"nope", "pointScaleRef" : "53411de55c4ac1fdcd47817a"};
            testHelper.authSession
                .post('/query')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with no existing ref for ranking system", function(done){
            var body = {"rankingSystemRef":"5341205b5c4ac1fdcd47817e", "pointScaleRef" : "53411de55c4ac1fdcd47817a"};
            testHelper.authSession
                .post('/query')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with no existing ref for point scale", function(done){
            var body = {"rankingSystemRef":"53411feb5c4ac1fdcd47817d", "pointScaleRef" : "5341205b5c4ac1fdcd47817e"};
            testHelper.authSession
                .post('/query')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with no ref", function(done){
            var body = {};
            testHelper.authSession
                .post('/query')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Update", function(){
        it("is secured", function(done){
            var body = {"rankingSystemRef":"53411feb5c4ac1fdcd47817d", "pointScaleRef" : "53411de55c4ac1fdcd47817a"};
            testHelper.publicSession
                .put('/query/53411dc15c4ac1fdcd478178')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("ranking system ref", function(done){
            var body = {"rankingSystemRef":"53411feb5c4ac1fdcd47817d"};
            testHelper.authSession
                .put('/query/53411dc15c4ac1fdcd478178')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("rankingSystemRef");
                    res.body.should.have.property("pointScaleRef");
                    res.body.rankingSystemRef.should.equal("53411feb5c4ac1fdcd47817d");
                    res.body.pointScaleRef.should.equal("5340caa05c4ac1fdcd478171");
                    done();
                });
        });

        it("point scale ref", function(done){
            var body = {"pointScaleRef":"53411de55c4ac1fdcd47817a"};
            testHelper.authSession
                .put('/query/53411dc15c4ac1fdcd478178')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("rankingSystemRef");
                    res.body.should.have.property("pointScaleRef");
                    res.body.rankingSystemRef.should.equal("5340bfc15c4ac1fdcd47816d");
                    res.body.pointScaleRef.should.equal("53411de55c4ac1fdcd47817a");
                    done();
                });
        });
    });

    describe("Delete", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .del('/query/53411dc15c4ac1fdcd478178')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("existing", function (done) {
            testHelper.authSession
                .del('/query/53411dc15c4ac1fdcd478178')
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
