var testHelper = module.exports = {};
var request = require('supertest');
var siteUrl = process.env.testUrl;
var mongoose = require('mongoose');
var moment = require('moment');
var mongoService = require('../app/mongoService');
var User = require('../app/user/user').model;
var GroupLevel = require('../app/groupLevel/groupLevel').model;
var RankingSystem = require('../app/ranking/rankingSystem').model;
var Race = require('../app/race/race').model;
var Greyhound = require('../app/greyhound/greyhound').model;
var Placing = require('../app/placing/placing').model;
var PointAllotment = require('../app/ranking/pointAllotment').model;
var Invite = require('../app/invite/invite').model;
testHelper.publicSession = request.agent(siteUrl);
testHelper.authSession = request.agent(siteUrl);
server = require("../server.js");

testHelper.login = function(agent , done){
    var cred = {email: 'link1900@gmail.com', password: 'tester'};
    agent
        .post('/login')
        .send(cred)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
};

testHelper.logout = function(agent , done){
    var cred = {email: 'link1900@gmail.com', password: 'tester'};
    agent
        .post('/logout')
        .send(cred)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
};

testHelper.setup = function(done){
    server.start().then(function(){
        testHelper.loadUsers(function(){
            testHelper.login(testHelper.authSession, done);
        });
    });
};

testHelper.tearDown = function(done){
    testHelper.clearUsers(function(){
        testHelper.logout(testHelper.authSession, done);
    });
};

testHelper.letter1000 = "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789";


testHelper.loadInvites = function(done){
    new Invite({
        "email" : "lilly@gmail.com",
        "token": "inviteToken1",
        "expiry" : moment().add(5, 'd').toDate(),
        "_id" : "5475a85de622166913516271"
    }).save(function(){
            new Invite({
                "email" : "oldinvite@gmail.com",
                "token": "inviteToken2",
                "expiry" : moment().subtract(5, 'd').toDate(),
                "_id" : "5475b7e6e622166913516273"
            }).save(done);
        });
};

testHelper.dropInvites = function(done){
    Invite.remove({}, function(){
        done();
    });
};

testHelper.loadUsers = function(done){
    var docs = [];
    docs.push(new User({
        "provider" : "local",
        "email" : "link1900@gmail.com",
        "firstName": "link",
        "lastName": "1900",
        "password" : "tester",
        "state" : "Active",
        "_id" : "532675365d68bab8234c7e7f"
    }));

    docs.push(new User({
        "provider" : "local",
        "email" : "joe@gmail.com",
        "firstName": "joe",
        "lastName": "doe",
        "password" : "tester",
        "state" : "Active",
        "_id" : "54683fd3daad610cccdd34da"
    }));

    docs.push(new User({
        "provider" : "local",
        "email" : "newuser@gmail.com",
        "firstName": "new",
        "lastName": "user",
        "password" : "tester",
        "state" : "Requested Access",
        "_id" : "5469d48ddaad610cccdd34db"
    }));

    docs.push(new User({
        "provider" : "local",
        "email" : "needpassword@gmail.com",
        "firstName": "need",
        "lastName": "password",
        "password" : "tester",
        "state" : "Active",
        "passwordReset":{
            tokenCreated: new Date(),
            token: "123a",
            expirationDate: moment().add(5, 'd').toDate()
        },
        "_id" : "546ff82ddaad610cccdd34de"
    }));

    docs.push(new User({
        "provider" : "local",
        "email" : "needpasswordexpire@gmail.com",
        "firstName": "need",
        "lastName": "password",
        "password" : "tester",
        "state" : "Active",
        "passwordReset":{
            tokenCreated: new Date(),
            token: "123b",
            expirationDate: new Date()
        },
        "_id" : "546ff836daad610cccdd34df"
    }));

    mongoService.createMany(docs).then(function(){
        done();
    }, function(err){
        done(err);
    });
};

testHelper.clearUsers = function(done){
    User.remove({}, done);
};

testHelper.loadGroupLevels = function(done){
    GroupLevel.remove({}, function(){
        new GroupLevel({"_id" : "531d1f72e407586c21476ef7",
            "name" : "Group 1",
            "level":1}).save(function(){
                new GroupLevel({"_id" : "531d1f72e407586c21476f0c",
                    "name" : "Group 2",
                    "level": 2}).save(function(){
                        new GroupLevel({"_id" : "531d1f72e407586c21476f0d",
                            "name" : "Group 3",
                            "level": 2}).save(done);
                    });
            });
    });
};

testHelper.loadPointAllotments = function(done){
    testHelper.loadPlacings(function(){
        testHelper.loadRankingSystem(function(){
            PointAllotment.remove({}, function () {
                new PointAllotment({
                    "_id": "540198de8bbd09f6ab7f49da",
                    "points": 70,
                    "placingRef": "531d1f82e407586c21476eb9",
                    "placing": {"greyhoundRef": "531d1f74e407586c2147737b"},
                    "rankingSystemRef" : "53412feb5c4ac1fdcd4781ff"
                }).save(function(){
                        new PointAllotment({
                            "_id": "540198de8bbd09f6ab7f49db",
                            "points": 50,
                            "placing": {"greyhoundRef": "53407b9d5c4ac1fdcd47816a"},
                            "placingRef": "531d1f82e407586c21476dc9",
                            "rankingSystemRef" : "53412feb5c4ac1fdcd4781ff"
                        }).save(done);
                    });
            });
        });
    });
};

testHelper.clearPointAllotments = function(done){
    PointAllotment.remove({}, done);
};


testHelper.loadRankingSystem = function(done){
    RankingSystem.remove({}, function(){
        new RankingSystem({"_id" : "5340bfc15c4ac1fdcd47816d",
            "name" : "Test Ranking System",
            "description":"test Rankings"}).save(function(){
                new RankingSystem({"_id" : "53411feb5c4ac1fdcd47817d",
                    "name" : "Mega Ranking System",
                    "description":"test rankings"}).save(function(){
                        new RankingSystem(    {
                            "_id" : "53412feb5c4ac1fdcd4781ff",
                            "name": "Agra Rankings",
                            "description": "The main ranking system for agra",
                            "equalPositionResolution": "splitPoints",
                            "pointAllotments":[
                                {
                                    criteria: [
                                        {field: "placing", "comparator": "=", "value": "1"}
                                    ],
                                    points: 70
                                }
                            ]
                        }).save(done);
                    });
            });
    });
};

testHelper.clearRankingSystems = function(done){
    RankingSystem.remove({}, done);
};

testHelper.clearGroupLevels = function(done){
    GroupLevel.remove({}, done);
};

testHelper.loadRaces = function(done){
    testHelper.loadGroupLevels(function(){
        Race.remove({}, function(){
            new Race({"_id" : "531d1f72e407586c21476ea8",
                "name" : "race1",
                "date": new Date(),
                "groupLevelRef":"531d1f72e407586c21476ef7",
                "groupLevel" : {"name" : "Group 1", "level":1},
                "distanceMeters": 515,
                "disqualified":false}).save(function(){
                    new Race({"_id" : "531d1f72e407586c21476ec4",
                        "name" : "Race2",
                        "date": new Date(),
                        "groupLevelRef":"531d1f72e407586c21476f0c",
                        "distanceMeters": 715,
                        "disqualified":false}).save(function(){
                            new Race({"_id" : "531d1f72e407586c21476e52",
                                "name" : "Race3",
                                "date": new Date(2014,5,5),
                                "groupLevelRef":"531d1f72e407586c21476f0c",
                                "distanceMeters": 715,
                                "disqualified":false}).save(done);
                        });
                });
        });
    });
};

testHelper.clearRaces = function(done){
    testHelper.clearGroupLevels(function(){
        Race.remove({}, done);
    });
};

testHelper.loadGreyhounds = function(done){
    Greyhound.remove({}, function(){
        new Greyhound({"_id" : "53340c2d8e791cd5d7c731d7", "name" : "grey1"}).save();
        new Greyhound({"_id":'531d1f74e407586c2147737b', name:"grey2"}).save();
        new Greyhound({"_id":'53407b9d5c4ac1fdcd47816a', name:"grey5"}).save();
        new Greyhound({"_id":'531d1f72e407586c21476e49', name:"grey4", sireRef:"53340c2d8e791cd5d7c731d7", damRef:"531d1f74e407586c2147737b"}).save();
        new Greyhound({"_id":'531d1f74e407586c214773df', name:"grey3"}).save(done);
    });
};

testHelper.clearGreyhounds = function(done){
    Greyhound.remove({}, done);
};

testHelper.loadPlacings = function(done){
    testHelper.loadRaces(function(){
        testHelper.loadGreyhounds(function(){
            Placing.remove({}, function(){
                new Placing({"_id" : "531d1f82e407586c21476eb9",
                    "placing" : "2",
                    "raceRef": "531d1f72e407586c21476ea8",
                    "greyhoundRef":"531d1f74e407586c2147737b"}).save();
                new Placing({"_id" : "531d1f82e407586c21476dc9",
                    "placing" : "3",
                    "raceRef": "531d1f72e407586c21476ea8",
                    "greyhoundRef":"53407b9d5c4ac1fdcd47816a"}).save();
                new Placing({"_id" : "531d1f82e407586c21476ea9",
                    "placing" : "1",
                    "raceRef": "531d1f72e407586c21476ea8",
                    "greyhoundRef":"53340c2d8e791cd5d7c731d7"}).save(done);
            });
        });
    });
};

testHelper.clearPlacings = function(done){
    Placing.remove({}, function(){
        testHelper.clearRaces(function(){
            testHelper.clearGreyhounds(done);
        });
    });
};