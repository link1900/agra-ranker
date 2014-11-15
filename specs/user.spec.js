var request = require('supertest');
var mongoose = require('mongoose');
var User = require('../app/user/user').model;
var testHelper = require('./testHelper');
var assert = require('chai').assert;

describe("User", function() {
    before(function (done) {
        testHelper.setup(done);
    });

    describe("Get", function(){
        it("me when logged in", function(done){
            testHelper.authSession
                .get('/me')
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
                .get('/me')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

//        it ("all users api is secured", function(done){
//            testHelper.publicSession
//                .get('/user')
//                .set('Accept', 'application/json')
//                .expect('Content-Type', /json/)
//                .expect(401, done);
//        });
//
//        it("get all users", function(done){
//            testHelper.authSession
//                .get('/user/532675365d68bab8234c7e7f')
//                .set('Accept', 'application/json')
//                .expect('Content-Type', /json/)
//                .expect(200)
//                .end(function(err, res){
//                    if (err){ throw err; }
//                    assert.lengthOf(res.body, 1);
//                    done();
//                });
//        });

        it ("single users api is secured", function(done){
            testHelper.publicSession
                .get('/user/532675365d68bab8234c7e7f')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("single user get the user", function(done){
            testHelper.authSession
                .get('/user/532675365d68bab8234c7e7f')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.property(res.body, "email");
                    assert.equal(res.body.email, "link1900@gmail.com");
                    done();
                });
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