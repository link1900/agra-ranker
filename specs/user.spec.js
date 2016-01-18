var request = require('supertest');
var Invite = require('../app/invite/invite').model;
var testHelper = require('./testHelper');
var siteUrl = process.env.testUrl;
var assert = require('assert');

describe("User", function() {
    before(function (done) {
        testHelper.setup(function(){
            testHelper.loadInvites(done);
        });
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
                    assert(res.body.email,"link1900@gmail.com");
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
                    assert(res.body.length === 5);
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
                    assert.equal(res.body.email, "link1900@gmail.com");
                    done();
                });
        });
    });

    describe("Request access", function(){
        it("fails with invalid body", function(done){
            var body = {};

            testHelper.publicSession
                .post('/user/requestAccess')
                .send(body).set('Accept', 'application/json').expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("success with new email", function(done){
            var body = {
                "email" : "jimmy@gmail.com",
                "password" : "tester",
                "firstName": "jim",
                "lastName":"goodwin"
            };

            testHelper.publicSession
                .post('/user/requestAccess')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.state, "Requested Access");
                    done();
                });
        });

        it("fails with invalid invite token", function(done){
            var body = {"email" : "lilly@gmail.com", "password" : "tester", "firstName": "Lilly", "lastName":"Brown",
                "inviteToken": "badToken"
            };

            testHelper.publicSession
                .post('/user/requestAccess')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("fails with expired invite token", function(done){
            var body = {"email" : "oldinvite@gmail.com", "password" : "tester", "firstName": "old", "lastName":"invite",
                "inviteToken": "inviteToken2"
            };

            testHelper.publicSession
                .post('/user/requestAccess')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("success with valid invite token", function(done){
            var body = {"email" : "lilly@gmail.com", "password" : "tester", "firstName": "Lilly", "lastName":"Brown",
                "inviteToken": "inviteToken1"
            };

            testHelper.publicSession
                .post('/user/requestAccess')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.state, "Active");
                    Invite.findOne({"email" : "lilly@gmail.com"}, function(err2, result){
                        if (err2){ throw err2; }
                        if(result != null){
                            done(new Error("should find the invite after its been used"));
                        } else {
                            done();
                        }
                    });
                });
        });

        it("success with valid bootstrap", function(done){
            var body = {
                "email" : "admin@gmail.com",
                "password" : "tester",
                "firstName": "Admin",
                "lastName":"Master",
                "bootstrap": "teststart"
            };

            testHelper.tearDown(function() {
                testHelper.publicSession
                    .post('/user/requestAccess')
                    .send(body)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res){
                        if (err){ throw err; }
                        assert.equal(res.body.state, "Active");
                        assert.equal(res.body.email, "admin@gmail.com");
                        assert.equal(res.body.settings.notifications.newUserRequest, true);
                        done();
                    });
            });
        });

        after(function (done) {
            testHelper.tearDown(function(){
                testHelper.dropInvites(function(){
                    testHelper.setup(function(){
                        testHelper.loadInvites(done);
                    });
                });
            });
        });
    });

    describe("Create active user", function(){
         it("is secured", function(done){
            var body = {
                "email" : "nbrown99@gmail.com",
                "firstName":"Neil",
                "lastName": "Brown",
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
                "firstName":"Neil",
                "lastName": "Brown",
                "password" : "tester"
            };

            testHelper.authSession
                .post('/user')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.email, "nbrown99@gmail.com");
                    var url = '/user/' + res.body._id;
                    testHelper.authSession
                        .get(url)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(function(err, res){
                            if (err){ throw err; }
                            assert.equal(res.body.email, "nbrown99@gmail.com");
                            assert.equal(res.body.state, "Active");
                            done();
                        });
                });
        });

        it("fails when using an existing email", function(done){
            var body = {
                "email" : "link1900@gmail.com",
                "firstName":"Neil",
                "lastName": "Brown",
                "password" : "test"
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
                "firstName":"Neil",
                "lastName": "Brown",
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
                "email" : "joe@gmail.com",
                "firstName":"Neil",
                "lastName": "Brown"
            };
            testHelper.authSession
                .post('/user')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("without a first name", function(done){
            var body = {
                "email" : "joe@gmail.com",
                "lastName": "Brown",
                "password" : "test"

            };
            testHelper.authSession
                .post('/user')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("without a last name", function(done){
            var body = {
                "email" : "joe@gmail.com",
                "firstName": "Brown",
                "password" : "test"

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
                    assert.equal(res.body.email, "link1704@hotmail.com");
                    var url = '/user/' + res.body._id;
                    testHelper.authSession
                        .get(url)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(function(err, res){
                            if (err){ throw err; }
                            assert.equal(res.body.email, "link1704@hotmail.com");
                            done();
                        });
                });
        });
    });

    describe("Grant Access", function() {
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
                    assert.equal(res.body.state, "Active");
                    done();
                });
        });
    });

    describe("Change Password", function() {

        before(function (done) {
            testHelper.tearDown(function(){
                testHelper.setup(done);
            });
        });

        it("is secure", function (done) {
            testHelper.publicSession
                .post('/user/changePassword')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("cant change with empty body", function (done) {
            var body = {};
            testHelper.authSession
                .post('/user/changePassword')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("cant change with incorrect existing password body", function (done) {
            var body = {existingPassword: "nope", newPassword : "tester1"};
            testHelper.authSession
                .post('/user/changePassword')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("cant change with invalid new password", function (done) {
            var body = {existingPassword: "tester", newPassword : "sml"};
            testHelper.authSession
                .post('/user/changePassword')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("can change password", function (done) {
            var body = {existingPassword: "tester", newPassword : "tester2"};
            var cred = {email: 'link1900@gmail.com', password: 'tester2'};
            testHelper.authSession
                .post('/user/changePassword')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, function(){
                    request(siteUrl)
                        .post('/login')
                        .send(cred)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });
        });
    });

    describe("Reset Password", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .post('/user/resetPassword/532675365d68bab8234c7e7f')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("can change user password", function (done) {
            testHelper.authSession
                .post('/user/resetPassword/532675365d68bab8234c7e7f')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, function(err){
                    if (err){ throw err; }
                    done();
                });
        });
    });

    describe("Change password with token" ,function(){
        it("user with a valid reset token can change password", function (done) {
            var body = {newPassword : "tester2"};
            var cred = {email: 'needpassword@gmail.com', password: 'tester2'};
            testHelper.publicSession
                .post('/user/changePasswordToken/123a')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err){
                    if (err){ throw err; }
                    request(siteUrl)
                        .post('/login')
                        .send(cred)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200, done);
                });
        });

        it("doesnt work with unknown token", function (done) {
            var body = {newPassword : "tester2"};
            testHelper.publicSession
                .post('/user/changePasswordToken/fakeToken')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("user with a expired reset token should fail", function (done) {
            var body = {newPassword : "tester3"};
            testHelper.publicSession
                .post('/user/changePasswordToken/123b')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Forgotten password" ,function(){
        it("should fail with no email", function (done) {
            var body = {email : ""};
            testHelper.publicSession
                .post('/user/forgotten')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("should fail with no body", function (done) {
            testHelper.publicSession
                .post('/user/forgotten')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("should work with non user", function (done) {
            var body = {email : "notauser@gmail.com"};
            testHelper.publicSession
                .post('/user/forgotten')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("should work with real user", function (done) {
            var body = {email : "joe@gmail.com"};
            testHelper.publicSession
                .post('/user/forgotten')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
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
        testHelper.tearDown(function(){
            testHelper.dropInvites(done);
        });
    });

});