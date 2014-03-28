var testHelper = module.exports = {};
var request = require('supertest');
var siteUrl = process.env.testUrl;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var AllowedUser = mongoose.model('AllowedUser');
testHelper.publicSession = request.agent(siteUrl);
testHelper.authSession = request.agent(siteUrl);

testHelper.login = function(agent , done){
    var cred = {email: 'link1900@gmail.com', password: 'test'};
    agent
        .post('/login')
        .send(cred)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
};

testHelper.logout = function(agent , done){
    var cred = {email: 'link1900@gmail.com', password: 'test'};
    agent
        .post('/logout')
        .send(cred)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
};

testHelper.setup = function(done){
    testHelper.loadUsers(function(){
        testHelper.login(testHelper.authSession, done);
    });
};

testHelper.tearDown = function(done){
    testHelper.clearUsers(function(){
        testHelper.logout(testHelper.authSession, done);
    });
};

testHelper.loadUsers = function(done){
    new AllowedUser({"email":"nbrown99@gmail.com"}).save();
    new AllowedUser({"email":"link1900@gmail.com"}).save();
    new User({
        "provider" : "local",
        "email" : "link1900@gmail.com",
        "password" : "test",
        "_id" : "532675365d68bab8234c7e7f"
    }).save(done);
};

testHelper.clearUsers = function(done){
    User.remove({}, done);
};