var testHelper = module.exports = {};
process.env.EMAIL_OVERRIDE='email@localhost';
process.env.MONGO_URL='mongodb://localhost/ranker-test';
process.env.PORT = 3001;
process.env.NODE_ENV='test';
process.env.testUrl='http://localhost:3001';
process.env.FIRST_USER_PASSCODE='teststart';

var request = require('supertest');
var siteUrl = process.env.testUrl;
var jwt = require('jsonwebtoken');
var RankingSystem = require('../app/ranking/rankingSystem').model;
var Race = require('../app/race/race').model;
var Greyhound = require('../app/greyhound/greyhound').model;
var Placing = require('../app/placing/placing').model;
testHelper.publicSession = request.agent(siteUrl);
testHelper.authSession = request.agent(siteUrl);
var server = require("../server.js");

testHelper.createAuthTestToken = function(done){
    var user = {email: 'link1900@gmail.com'};
    jwt.sign(user, new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'), {
        expiresIn: 300,
        issuer: 'https://app23098245.auth0.com/',
        audience: process.env.AUTH0_CLIENT_ID,
        subject: 'google-oauth2|100071916930898381238'
    }, function(error, token){
        testHelper.authToken = token;
        done();
    });
};

testHelper.setup = function(done){
    server.start().then(function(){
        testHelper.createAuthTestToken(function(){
            done();
        });
    });
};

testHelper.tearDown = function(done){
    done();
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

testHelper.loadRaces = function(done){
    Race.remove({}, function(){
        new Race({"_id" : "531d1f72e407586c21476ea8",
            "name" : "race1",
            "date": new Date(),
            "groupLevelName":"Group 1",
            "distanceMeters": 515,
            "disqualified":false}).save(function(){
            new Race({"_id" : "531d1f72e407586c21476ec4",
                "name" : "Race2",
                "date": new Date(),
                "groupLevelName":"Group 2",
                "distanceMeters": 715,
                "disqualified":false}).save(function(){
                new Race({"_id" : "531d1f72e407586c21476e52",
                    "name" : "Race3",
                    "date": new Date(2014,5,5),
                    "groupLevelName":"Group 2",
                    "distanceMeters": 715,
                    "disqualified":false}).save(done);
            });
        });
    });
};

testHelper.clearRaces = function(done){
    Race.remove({}, done);
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

testHelper.setupRankingTestData = function(done){
    var rankingSystem1 = {
        _id: "54ac8b031ee51022d545c8fc",
        "name": "Test ranking system",
        "description": "Test ranking system",
        equalPositionResolution: "splitPoints",
        groupBy: {
            label: "greyhound.name",
            field: "greyhoundRef"
        },
        updatedAt: new Date(),
        commonCriteria: [
            {field: "race.disqualified", "comparator": "=", "value": false}
        ],
        pointAllotments: [{
            criteria: [
                {field: "placing", "comparator": "=", "value": "1"},
                {field: "race.groupLevelName", "comparator": "=", "value": "Group 3"},
                {field: "race.distanceMeters", "comparator": "<", "value": 715}
            ],
            points: 20
        },{
            criteria: [
                {field: "placing", "comparator": "=", "value": "2"},
                {field: "race.groupLevelName", "comparator": "=", "value": "Group 3"},
                {field: "race.distanceMeters", "comparator": "<", "value": 715}
            ],
            points: 10
        },{
            criteria: [
                {field: "placing", "comparator": "=", "value": "3"},
                {field: "race.groupLevelName", "comparator": "=", "value": "Group 3"},
                {field: "race.distanceMeters", "comparator": "<", "value": 715}
            ],
            points: 5
        }]
    };

    var john = {
        _id: '54ac8d5e1ee51022d545c8fe',
        name: "john"
    };
    var sally = {
        _id: '54ac8da71ee51022d545c900',
        name: "sally"
    };
    var molly = {
        _id: '54ac8dac1ee51022d545c901',
        name: "molly"
    };
    var jane = {
        _id: '54ac8db01ee51022d545c902',
        name: "jane"
    };

    var rankingRace1 = {
        "_id": "54ac8e011ee51022d545c904",
        "distanceMeters": 500,
        "groupLevelName": "Group 3",
        "name": "rankingRace1",
        date: new Date(2014,8,8),
        "disqualified": false
    };
    var rankingRace2 = {
        "_id": "54ac8e1a1ee51022d545c905",
        "distanceMeters": 500,
        "groupLevelName": "Group 3",
        "name": "rankingRace1",
        date: new Date(2014,8,8),
        "disqualified": false
    };
    var rankingRace3 = {
        "_id": "54ac8e221ee51022d545c906",
        "distanceMeters": 500,
        "groupLevelName": "Group 3",
        "name": "rankingRace1",
        date: new Date(2012,8,8),
        "disqualified": false
    };

    var johnRankingRace1 = {
        "greyhound": john,
        "race": rankingRace1,
        "placing": "1",
        _id:"54aca1da1ee51022d545c909",
        "raceRef": rankingRace1._id,
        "greyhoundRef": john._id
    };

    var sallyRankingRace1 = {
        "greyhound": sally,
        "race": rankingRace1,
        "placing": "2",
        _id:"54aca2661ee51022d545c90a",
        "raceRef": rankingRace1._id,
        "greyhoundRef": sally._id
    };

    var mollyRankingRace1 = {
        "greyhound": molly,
        "race": rankingRace1,
        _id:"54aca2721ee51022d545c90b",
        "placing": "3",
        "raceRef": rankingRace1._id,
        "greyhoundRef": molly._id
    };

    var johnRankingRace2 = {
        "greyhound": john,
        "race": rankingRace2,
        _id:"54aca27e1ee51022d545c90c",
        "placing": "1",
        "raceRef": rankingRace2._id,
        "greyhoundRef": john._id
    };

    var janeRankingRace2 = {
        "greyhound": jane,
        "race": rankingRace2,
        _id:"54aca28f1ee51022d545c90d",
        "placing": "2",
        "raceRef": rankingRace2._id,
        "greyhoundRef": jane._id
    };

    var johnRankingRace3 = {
        "greyhound": john,
        "race": rankingRace3,
        _id:"54aca29d1ee51022d545c90e",
        "placing": "1",
        "raceRef": rankingRace3._id,
        "greyhoundRef": john._id
    };

    Placing.remove({}, function(){
        new Placing(johnRankingRace1).save(function(){
            new Placing(sallyRankingRace1).save(function(){
                new Placing(mollyRankingRace1).save(function(){
                    new Placing(janeRankingRace2).save(function(){
                        new Placing(johnRankingRace2).save(function(){
                            new Placing(johnRankingRace3).save(function(){
                                new RankingSystem(rankingSystem1).save(function(){
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

testHelper.removeRankingData = function(done){
    RankingSystem.remove({}, function(){
        Placing.remove({}, function(){
            done();
        });
    })
};

testHelper.clearPlacings = function(done){
    Placing.remove({}, function(){
        testHelper.clearRaces(function(){
            testHelper.clearGreyhounds(done);
        });
    });
};