var request = require('supertest');
var mongoose = require('mongoose');
var testHelper = require('./testHelper');
var assert = require('chai').assert;

describe("Invite", function() {
    before(function (done) {
        testHelper.setup(function(){
            testHelper.loadInvites(done)
        });
    });

    describe("Get", function(){
        it ("should return 401 when not logged in", function(done){
            testHelper.publicSession
                .get('/invite')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("should get all", function(done){
            testHelper.authSession
                .get('/invite')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it ("get single is secured", function(done){
            testHelper.publicSession
                .get('/invite/5475a85de622166913516271')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("get single", function(done){
            testHelper.authSession
                .get('/invite/5475a85de622166913516271')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.property(res.body, "email");
                    assert.notProperty(res.body, "token");
                    assert.equal(res.body.email, "lilly@gmail.com");
                    done();
                });
        });
    });

    describe("Invite user" ,function(){
        it("is secure", function (done) {
            testHelper.publicSession
                .post('/invite')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("should fail with no body", function (done) {
            testHelper.authSession
                .post('/invite')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("should fail for invalid email", function (done) {
            var body = {email : "not email"};
            testHelper.authSession
                .post('/invite')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("should work", function (done) {
            var body = {email : "inviteduser@gmail.com"};
            testHelper.authSession
                .post('/invite')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("should not work for existing user", function (done) {
            var body = {email : "link1900@gmail.com"};
            testHelper.authSession
                .post('/invite')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Delete", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .del('/invite/5475a85de622166913516271')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("delete invite", function (done) {
            testHelper.authSession
                .del('/invite/5475a85de622166913516271')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("delete expired is secured", function (done) {
            testHelper.publicSession
                .del('/invite/expired')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("delete expired", function (done) {
            testHelper.authSession
                .del('/invite/expired')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    after(function (done) {
        testHelper.tearDown(function(){
            testHelper.dropInvites(done);
        });
    });
});

