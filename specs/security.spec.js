var request = require('supertest');
var siteUrl = process.env.testUrl;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var testHelper = require('./testHelper');

describe("Security", function() {
    before(function (done) {
        testHelper.setup(done);
    });

    describe("Login", function(){
        it("with known user and valid credentials", function(done){
            var cred = {email: 'link1900@gmail.com', password: 'test'};
            request(siteUrl)
                .post('/login')
                .send(cred)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    done();
                });
        });

        it("with unknown user", function(done){
            var cred = {email: 'fake@gmail.com', password: 'test'};
            request(siteUrl)
                .post('/login')
                .send(cred)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with known user invalid credentials", function(done){
            var cred = {email: 'link1900@gmail.com', password: 'wrongpassword'};
            request(siteUrl)
                .post('/login')
                .send(cred)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });
    });

    describe("Logout", function(){
        it("succesfully", function(done){
            testHelper.authSession
                .post('/logout')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});