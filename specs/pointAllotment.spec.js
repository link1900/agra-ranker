var request = require('supertest');
var mongoose = require('mongoose');
var assert = require('chai').assert;
var testHelper = require('./testHelper');

describe("Point Allotments", function(){
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        testHelper.loadPointAllotments(done);
    });

    describe("Get", function(){
        it("single point allotment by id", function(done){
            testHelper.publicSession
                .get('/pointAllotment/540198de8bbd09f6ab7f49da')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ console.log(res); throw err; }
                    assert.equal(res.body.points, 70);
                    assert.equal(res.body.greyhoundRef, '531d1f74e407586c2147737b');
                    done();
                });
        });

        it("many", function(done){
            testHelper.publicSession
                .get('/pointAllotment')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ console.log(res); throw err; }
                    assert(res.body.length > 1);
                    done();
                });
        });

        it("search by valid ranking system ref", function(done){
            testHelper.publicSession
                .get('/pointAllotment?rankingSystemRef=53412feb5c4ac1fdcd4781ff')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ console.log(res); throw err; }
                    assert.equal(res.body.length, 2);
                    done();
                });
        });

        it("search by valid greyhound ref", function(done){
            testHelper.publicSession
                .get('/pointAllotment?greyhoundRef=531d1f74e407586c2147737b')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ console.log(res); throw err; }
                    assert.equal(res.body.length, 1);
                    done();
                });
        });

        it("search by invalid greyhound ref", function(done){
            testHelper.publicSession
                .get('/pointAllotment?greyhoundRef=222')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("search by invalid ranking system ref", function(done){
            testHelper.publicSession
                .get('/pointAllotment?rankingSystemRef=333')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Create", function() {
        it("is secured", function(done){
            testHelper.publicSession
                .post('/pointAllotment?rankingSystemRef=53412feb5c4ac1fdcd4781ff')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with valid ranking system", function(done){
            testHelper.authSession
                .post('/pointAllotment?rankingSystemRef=53412feb5c4ac1fdcd4781ff')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    console.log(res.body);
                    done(false);
                });
        });
    });

    afterEach(function(done){
        testHelper.clearPointAllotments(done);
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
