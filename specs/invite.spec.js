var request = require('supertest');
var mongoose = require('mongoose');
var testHelper = require('./testHelper');
var assert = require('chai').assert;

describe("Invite", function() {
    before(function (done) {
        testHelper.setup(done);
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

    after(function (done) {
        testHelper.tearDown(done);
    });
});

