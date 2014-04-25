var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
chai.should();
var expect = chai.expect;
var Placing = mongoose.model('Placing');
var testHelper = require('./testHelper');

describe("Placing", function(){
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        testHelper.loadPlacings(done);
    });

    describe("Get", function(){
        it("many", function(done){
            testHelper.publicSession
                .get('/placing')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.length.should.be.above(2);
                    done();
                });
        });

        it("one by id", function(done){
            testHelper.publicSession
                .get('/placing/531d1f82e407586c21476eb9')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("placing");
                    res.body.placing.should.equal(2);
                    done();
                });
        });
    });

    describe("Create", function(){
        it("is secured", function(done){
            var body = {"placing" : 2, "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c2147737b"};
            testHelper.publicSession
                .post('/placing')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with just placing", function(done){
            var body = {"placing" : 3};
            testHelper.authSession
                .post('/placing')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with greyhound ref", function(done){
            var body = {"placing" : 3, "raceRef": "531d1f72e407586c21476ea8"};
            testHelper.authSession
                .post('/placing')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with just placing", function(done){
            var body = {"raceRef": "531d1f72e407586c21476ea8",  "greyhoundRef":"531d1f74e407586c214773df"};
            testHelper.authSession
                .post('/placing')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with really high placing", function(done){
            var body = {"placing" : 50, "raceRef": "531d1f72e407586c21476ea8",  "greyhoundRef":"531d1f74e407586c214773df"};
            testHelper.authSession
                .post('/placing')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with really low placing", function(done){
            var body = {"placing" : 0, "raceRef": "531d1f72e407586c21476ea8",  "greyhoundRef":"531d1f74e407586c214773df"};
            testHelper.authSession
                .post('/placing')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with negative placing", function(done){
            var body = {"placing" : -1, "raceRef": "531d1f72e407586c21476ea8",  "greyhoundRef":"531d1f74e407586c214773df"};
            testHelper.authSession
                .post('/placing')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with invalid race ref", function(done){
            var body = {"placing" : 3, "raceRef": "invalid",  "greyhoundRef":"531d1f74e407586c214773df"};
            testHelper.authSession
                .post('/placing')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with unlinked greyhound ref", function(done){
            var body = {"placing" : 3, "raceRef": "531d1f72e407586c21476ea8",  "greyhoundRef":"531d1f74f507586c214773df"};
            testHelper.authSession
                .post('/placing')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with existing placing", function(done){
            var body = {"placing" : 2, "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c2147737b"};
            testHelper.authSession
                .post('/placing')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with same greyhound different position", function(done){
            var body = {"placing" : 3, "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c2147737b"};
            testHelper.authSession
                .post('/placing')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with complete placing", function(done){
            var body = {"placing" : 5, "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c214773df"};
            testHelper.authSession
                .post('/placing')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("placing");
                    res.body.placing.should.equal(5);
                    res.body.should.have.property("greyhoundRef");
                    res.body.greyhoundRef.should.equal("531d1f74e407586c214773df");
                    res.body.should.have.property("raceRef");
                    res.body.raceRef.should.equal("531d1f72e407586c21476ea8");
                    done();
                });
        });
    });

    describe("Update", function(){
        it("is secured", function(done){
            var body = {"placing" : 2, "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c2147737b"};
            testHelper.publicSession
                .put('/placing/531d1f82e407586c21476eb9')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("existing placing", function(done){
            var body = {"placing" : 4};
            testHelper.authSession
                .put('/placing/531d1f82e407586c21476eb9')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("placing");
                    res.body.placing.should.equal(4);
                    res.body.should.have.property("greyhoundRef");
                    res.body.greyhoundRef.should.equal("531d1f74e407586c2147737b");
                    res.body.should.have.property("raceRef");
                    res.body.raceRef.should.equal("531d1f72e407586c21476ea8");
                    done();
                });
        });

        it("greyhoundRef", function(done){
            var body = {"greyhoundRef" : "531d1f72e407586c21476e49"};
            testHelper.authSession
                .put('/placing/531d1f82e407586c21476eb9')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("placing");
                    res.body.placing.should.equal(2);
                    res.body.should.have.property("greyhoundRef");
                    res.body.greyhoundRef.should.equal("531d1f72e407586c21476e49");
                    res.body.should.have.property("raceRef");
                    res.body.raceRef.should.equal("531d1f72e407586c21476ea8");
                    done();
                });
        });

        it("raceRef", function(done){
            var body = {"raceRef" : "531d1f72e407586c21476ec4"};
            testHelper.authSession
                .put('/placing/531d1f82e407586c21476eb9')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("placing");
                    res.body.placing.should.equal(2);
                    res.body.should.have.property("greyhoundRef");
                    res.body.greyhoundRef.should.equal("531d1f74e407586c2147737b");
                    res.body.should.have.property("raceRef");
                    res.body.raceRef.should.equal("531d1f72e407586c21476ec4");
                    done();
                });
        });
    });

    describe("Delete", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .del('/placing/531d1f82e407586c21476eb9')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("existing", function (done) {
            testHelper.authSession
                .del('/placing/531d1f82e407586c21476eb9')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("greyhound", function(done) {
            testHelper.authSession
                .get('/placing/531d1f82e407586c21476eb9')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);

            testHelper.authSession
                .del('/greyhound/531d1f74e407586c2147737b')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);

            testHelper.authSession
                .get('/placing/531d1f82e407586c21476eb9')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done());
        });

        it("race", function(done){
            testHelper.authSession
                .get('/placing/531d1f82e407586c21476eb9')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);

            testHelper.authSession
                .del('/race/531d1f72e407586c21476ea8')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);

            testHelper.authSession
                .get('/placing/531d1f82e407586c21476eb9')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done());
        });
    });

    afterEach(function(done){
        testHelper.clearPlacings(done);
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
