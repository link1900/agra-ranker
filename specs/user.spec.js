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

        it ("/user should return 401 when not logged in", function(done){
            testHelper.publicSession
                .get('/user')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("/user should get all users", function(done){
            testHelper.authSession
                .get('/user')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.lengthOf(res.body, 3);
                    done();
                });
        });

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
                    assert.notProperty(res.body, "password");
                    assert.equal(res.body.email, "link1900@gmail.com");
                    done();
                });
        });
    });

    describe("Request access", function(){
        it("success with new email", function(done){
            var body = {
                "email" : "jimmy@gmail.com",
                "password" : "test"
            };

            testHelper.publicSession
                .post('/user/requestAccess')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    describe("Create active user", function(){
         it("is secured", function(done){
            var body = {
                "email" : "nbrown99@gmail.com",
                "password" : "test"
            };
            testHelper.publicSession
                .post('/user')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with new email", function(done){
            var body = {
                "email" : "nbrown99@gmail.com",
                "password" : "test"
            };

            testHelper.authSession
                .post('/user')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.property(res.body, "email");
                    assert.property(res.body, "_id");
                    assert.notProperty(res.body, "password");
                    assert.equal(res.body.email, "nbrown99@gmail.com");
                    var url = '/user/' + res.body._id;
                    testHelper.authSession
                        .get(url)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(function(err, res){
                            if (err){ throw err; }
                            assert.property(res.body, "email");
                            assert.equal(res.body.email, "nbrown99@gmail.com");
                            done();
                        });
                });
        });

        it("fails when using an existing email", function(done){
            var body = {
                "email" : "link1900@gmail.com"
            };
            testHelper.authSession
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
            testHelper.authSession
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
            testHelper.authSession
                .post('/user')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Update", function() {
        it("is secure", function (done) {
            var body = {email:"link1704@hotmail.com"};
            testHelper.publicSession
                .put('/user/532675365d68bab8234c7e7f')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("fails given invalid state", function (done) {
            var body = {state: "dog"};
            testHelper.authSession
                .put('/user/532675365d68bab8234c7e7f')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("fails when trying to set the state incorrectly", function (done) {
            var body = {state: "Requested Access"};
            testHelper.authSession
                .put('/user/532675365d68bab8234c7e7f')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("fails when using an existing email", function(done){
            var body = {"email" : "link1900@gmail.com"};
            testHelper.authSession
                .put('/user/54683fd3daad610cccdd34da')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("succeeds given valid state", function (done) {
            var body = {state: "Active"};
            testHelper.authSession
                .put('/user/532675365d68bab8234c7e7f')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("email address", function (done) {
            var body = {email:"link1704@hotmail.com"};
            testHelper.authSession
                .put('/user/532675365d68bab8234c7e7f')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.property(res.body, "email");
                    assert.property(res.body, "_id");
                    assert.notProperty(res.body, "password");
                    assert.equal(res.body.email, "link1704@hotmail.com");
                    var url = '/user/' + res.body._id;
                    testHelper.authSession
                        .get(url)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(function(err, res){
                            if (err){ throw err; }
                            assert.property(res.body, "email");
                            assert.equal(res.body.email, "link1704@hotmail.com");
                            done();
                        });
                });
        });
    });

    describe("Request Access", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .post('/user/grantAccess/5469d48ddaad610cccdd34db')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("check you cannot grant access to users that haven't requested it", function (done) {
            testHelper.authSession
                .post('/user/grantAccess/532675365d68bab8234c7e7f')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("check you can successfully grants access", function (done) {
            testHelper.authSession
                .post('/user/grantAccess/5469d48ddaad610cccdd34db')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.property(res.body, "state");
                    assert.equal(res.body.state, "Active");
                    done();
                });
        });
    });

    describe("Delete", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .del('/user/532675365d68bab8234c7e7f')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("delete yourself", function (done) {
            testHelper.authSession
                .del('/user/532675365d68bab8234c7e7f')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    after(function (done) {
        testHelper.tearDown(done);
    });

});