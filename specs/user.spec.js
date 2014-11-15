var request = require('supertest');
var mongoose = require('mongoose');
var User = require('../user/user').model;
var testHelper = require('./testHelper');

describe("User", function() {
    before(function (done) {
        testHelper.setup(done);
    });

    describe("Get", function(){
        it("me when logged in", function(done){
            testHelper.authSession
                .get('/user/me')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("email");
                    res.body.email.should.equal("link1900@gmail.com");
                    done();
                });
        });

        it("me not logged in", function(done) {
            testHelper.publicSession
                .get('/user/me')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Create", function(){
        it("with new email not on white list", function(done){
            var body = {
                "email" : "joe@gmail.com",
                "password" : "test"
            };
            testHelper.publicSession
                .post('/user')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with new email on white list", function(done){
            var body = {
                "email" : "nbrown99@gmail.com",
                "password" : "test"
            };
            testHelper.publicSession
                .post('/user')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
        it("with existing email", function(done){
            var body = {
                "email" : "link1900@gmail.com",
                "password" : "test"
            };
            testHelper.publicSession
                .post('/user')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
        it("without an email", function(done){
            var body = {
                "password" : "test"
            };
            testHelper.publicSession
                .post('/user')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
        it("without a password", function(done){
            var body = {
                "email" : "joe@gmail.com"
            };
            testHelper.publicSession
                .post('/user')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});