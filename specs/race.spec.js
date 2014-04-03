var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
chai.should();
var expect = chai.expect;
var Race = mongoose.model('Race');
var testHelper = require('./testHelper');

describe("Race", function(){
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        testHelper.loadGroupLevels(function(){
            Race.remove({}, function(){
                new Race({"_id" : "531d1f72e407586c21476ea8",
                    "name" : "race1",
                    "date": new Date(),
                    "groupLevelRef":"531d1f72e407586c21476ef7",
                    "distanceMeters": 515,
                    "disqualified":false}).save();
                new Race({"_id" : "531d1f72e407586c21476ec4",
                    "name" : "race2",
                    "date": new Date(),
                    "groupLevelRef":"531d1f72e407586c21476f0c",
                    "distanceMeters": 715,
                    "disqualified":false}).save(done);
            });
        });
    });

    describe("Get", function(){
        it("many", function(done){
            testHelper.publicSession
                .get('/race')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.length(2);
                    done();
                });
        });

        it("one by id", function(done){
            testHelper.publicSession
                .get('/race/531d1f72e407586c21476ea8')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("race1");
                    res.body.should.have.property("groupLevelRef");
                    res.body.groupLevelRef.should.equal("531d1f72e407586c21476ef7");
                    res.body.should.have.property("distanceMeters");
                    res.body.distanceMeters.should.equal(515);
                    res.body.should.have.property("disqualified");
                    res.body.disqualified.should.equal(false);
                    done();
                });
        });
    });

    describe("Create", function(){
        it("is secured", function(done){
            var body = {name:"raceCreated"};
            testHelper.publicSession
                .post('/race')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with valid race", function(done){
            var body = {name:"raceCreated",
                date: new Date(),
                "groupLevelRef": "531d1f72e407586c21476ef7",
                "distanceMeters": 515,
                "disqualified":false};
            testHelper.authSession
                .post('/race')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                //.expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("raceCreated");
                    res.body.should.have.property("groupLevelRef");
                    res.body.groupLevelRef.should.equal("531d1f72e407586c21476ef7");
                    res.body.should.have.property("distanceMeters");
                    res.body.distanceMeters.should.equal(515);
                    res.body.should.have.property("disqualified");
                    res.body.disqualified.should.equal(false);
                    done();
                });
        });

        it("with name empty body", function(done){
            var body = {};
            testHelper.authSession
                .post('/race')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done)
        });

        it("with just name", function(done){
            var body = {name:"raceCreated"};
            testHelper.authSession
                .post('/race')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Update", function(){
        it("is secured", function(done){
            var body = {name:"raceUpdated"};
            testHelper.publicSession
                .put('/race/531d1f72e407586c21476ea8')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with valid race", function(done){
            var body = {name:"raceUpdated",
                date: new Date(),
                "groupLevelRef": "531d1f72e407586c21476ef7",
                "distanceMeters": 515,
                "disqualified":false};
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("raceUpdated");
                    res.body.should.have.property("groupLevelRef");
                    res.body.groupLevelRef.should.equal("531d1f72e407586c21476ef7");
                    res.body.should.have.property("distanceMeters");
                    res.body.distanceMeters.should.equal(515);
                    res.body.should.have.property("disqualified");
                    res.body.disqualified.should.equal(false);
                    done();
                });
        });

        it("with empty body", function(done){
            var body = {};
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("with just name", function(done){
            var body = {name:"raceUpdated"};
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("with invalid groupLevelRef", function(done){
            var body = {name:"raceUpdated",
                date: new Date(),
                "groupLevelRef": "heyya",
                "distanceMeters": 515,
                "disqualified":false};
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with valid but not existing groupLevelRef", function(done){
            var body = {name:"raceUpdated",
                date: new Date(),
                "groupLevelRef": "531d1f72e407586c21476eaf",
                "distanceMeters": 515,
                "disqualified":false};
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with no groupRef", function(done){
            var body = {name:"raceUpdated",
                date: new Date(),
                "distanceMeters": 515,
                "disqualified":false};
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("with no date", function(done){
            var body = {name:"raceUpdated",
                date: new Date(),
                "groupLevelRef": "531d1f72e407586c21476ef7",
                "distanceMeters": 515,
                "disqualified":false};
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    describe("Delete", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .del('/race/531d1f72e407586c21476ea8')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("delete existing race1", function (done) {
            testHelper.authSession
                .del('/race/531d1f72e407586c21476ea8')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("delete group1 should remove its ref", function (done) {
            testHelper.authSession
                .del('/groupLevel/531d1f72e407586c21476ef7')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    testHelper.publicSession
                        .get('/race/531d1f72e407586c21476ea8')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(function(err, res){
                            if (err){ throw err; }
                            res.body.should.have.property("name");
                            res.body.name.should.equal("race1");
                            res.body.should.have.property("groupLevelRef");
                            expect(res.body.groupLevelRef).equal(null);
                            done();
                        });
                });
        });
    });

    afterEach(function(done){
        testHelper.clearGroupLevels(function(){
            Race.remove({}, done);
        });
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
