var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
chai.should();
var expect = chai.expect;
var RankingSystem = mongoose.model('RankingSystem');
var testHelper = require('./testHelper');

describe("Ranking System", function(){
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        testHelper.loadRankingSystem(done);
    });

    describe("Get", function(){
        it("many", function(done){
            testHelper.publicSession
                .get('/rankingSystem')
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
                .get('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("Test Ranking System");
                    res.body.should.have.property("description");
                    done();
                });
        });
    });

    describe("Create", function(){
        it("is secured", function(done){
            var body = {name:"Another Test Ranking System", description: "just another ranking system"};
            testHelper.publicSession
                .post('/rankingSystem')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with valid json", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
                pointAllotments:[
                    {
                        points: 70
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("Another Test Ranking System");
                    res.body.should.have.property("description");
                    res.body.description.should.equal("just another ranking system");
                    done();
                });
        });

        it("with empty allotment definitions", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
                pointAllotments:[]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("with same name", function(done){
            var body = {name:"Agra Rankings", description: "just another ranking system"};
            testHelper.authSession
                .post('/rankingSystem')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with invalid resolution", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "nope"
            };
            testHelper.authSession
                .post('/rankingSystem')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with invalid allotment", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
                pointAllotments: "oops"
            };
            testHelper.authSession
                .post('/rankingSystem')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with missing allotment points", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
                pointAllotments: [
                    {
                        ignored: ""
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with invalid allotment points", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
                pointAllotments: [
                    {
                        points: "haha"
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("without name", function(done){
            var body = { description: "just another ranking system"};
            testHelper.authSession
                .post('/rankingSystem')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("without description", function(done){
            var body = {name:"Another Test Ranking System"};
            testHelper.authSession
                .post('/rankingSystem')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("with long description", function(done){
            var body = {description:testHelper.letter1000};
            testHelper.authSession
                .post('/rankingSystem')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Update", function(){
        it("is secured", function(done){
            var body = {name:"Changed Ranking System"};
            testHelper.publicSession
                .put('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with different name", function(done){
            var body = {name:"Changed Ranking System"};
            testHelper.authSession
                .put('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("Changed Ranking System");
                    res.body.should.have.property("description");
                    done();
                });
        });

        it("with different description", function(done){
            var body = {description:"a different description"};
            testHelper.authSession
                .put('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("description");
                    res.body.description.should.equal("a different description");
                    done();
                });
        });
    });

    describe("Delete", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .del('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("existing system", function (done) {
            testHelper.authSession
                .del('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("removed the rankings");
    });

    afterEach(function(done){
        testHelper.clearRankingSystems(done);
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
