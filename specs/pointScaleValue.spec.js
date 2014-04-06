var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
chai.should();
var expect = chai.expect;
var testHelper = require('./testHelper');

describe("Point Scale Value", function(){
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        testHelper.loadPointScale(function(){
            testHelper.loadPointScaleValue(done);
        });
    });

    describe("Get", function(){
        it("many", function(done){
            testHelper.publicSession
                .get('/pointScaleValue')
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
                .get('/pointScaleValue/5340cc015c4ac1fdcd478175')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("pointScaleRef");
                    res.body.should.have.property("placing");
                    res.body.should.have.property("points");
                    res.body.pointScaleRef.should.equal("5340caa05c4ac1fdcd478171");
                    res.body.placing.should.equal(1);
                    res.body.points.should.equal(70);
                    done();
                });
        });
    });

    describe("Create", function(){
        it("is secured", function(done){
            var body = {"pointScaleRef":"5340caa05c4ac1fdcd478171", "placing" : 2, "points":40};
            testHelper.publicSession
                .post('/pointScaleValue')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with valid json", function(done){
            var body = {"pointScaleRef":"5340caa05c4ac1fdcd478171", "placing" : 2, "points":40};
            testHelper.authSession
                .post('/pointScaleValue')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("pointScaleRef");
                    res.body.should.have.property("placing");
                    res.body.should.have.property("points");
                    res.body.pointScaleRef.should.equal("5340caa05c4ac1fdcd478171");
                    res.body.placing.should.equal(2);
                    res.body.points.should.equal(40);
                    done();
                });
        });

        it("with invalid ref", function(done){
            var body = {"pointScaleRef":"nope", "placing" : 2, "points":40};
            testHelper.authSession
                .post('/pointScaleValue')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with no existing ref", function(done){
            var body = {"pointScaleRef":"5340cab05c4ac1fdcd478172", "placing" : 2, "points":40};
            testHelper.authSession
                .post('/pointScaleValue')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with no placing", function(done){
            var body = {"pointScaleRef":"5340caa05c4ac1fdcd478171", "points":40};
            testHelper.authSession
                .post('/pointScaleValue')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with no points", function(done){
            var body = {"pointScaleRef":"5340caa05c4ac1fdcd478171", "placing" : 2};
            testHelper.authSession
                .post('/pointScaleValue')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with no ref", function(done){
            var body = { "placing" : 2, "points":40};
            testHelper.authSession
                .post('/pointScaleValue')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Update", function(){
        it("is secured", function(done){
            var body = {"pointScaleRef":"5340caa05c4ac1fdcd478171", "placing" : 2, "points":40};
            testHelper.publicSession
                .put('/pointScaleValue/5340cc015c4ac1fdcd478175')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("placing", function(done){
            var body = {"placing" : 3};
            testHelper.authSession
                .put('/pointScaleValue/5340cc015c4ac1fdcd478175')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("pointScaleRef");
                    res.body.should.have.property("placing");
                    res.body.should.have.property("points");
                    res.body.pointScaleRef.should.equal("5340caa05c4ac1fdcd478171");
                    res.body.placing.should.equal(3);
                    done();
                });
        });

        it("points", function(done){
            var body = {"points" : 30};
            testHelper.authSession
                .put('/pointScaleValue/5340cc015c4ac1fdcd478175')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("pointScaleRef");
                    res.body.should.have.property("placing");
                    res.body.should.have.property("points");
                    res.body.pointScaleRef.should.equal("5340caa05c4ac1fdcd478171");
                    res.body.points.should.equal(30);
                    done();
                });
        });
    });

    describe("Delete", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .del('/pointScaleValue/5340cc015c4ac1fdcd478175')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("existing", function (done) {
            testHelper.authSession
                .del('/pointScaleValue/5340cc015c4ac1fdcd478175')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    afterEach(function(done){
        testHelper.clearPointScale(function(){
            testHelper.clearPointScaleValue(done);
        });
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
