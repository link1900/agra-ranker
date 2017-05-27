var assert = require('assert');
var testHelper = require('./testHelper');
var Placing = require('../app/placing/placing').model;
var Score = require('../app/ranking/score').model;
var Ranking = require('../app/ranking/ranking').model;
var scoreService = null;

describe("scoreService", function(){

    var placing1 = {
        "greyhound" : {
            "name" : "dog1"
        },
        "race" : {
            "distanceMeters" : 500,
            "date" :new Date(),
            "groupLevelName": "Group 3",
            "name" : "race1",
            "disqualified" : false
        },
        "placing" : "3",
        "raceRef" : "5525009dc913f92a174f781a",
        "greyhoundRef" : "5517af08f80dcb0000248f87"
    };

    var placing2 = {
        "greyhound" : {
            "name" : "dog1"
        },
        "race" : {
            "distanceMeters" : 500,
            "date" :new Date(),
            "groupLevelName": "Group 3",
            "name" : "race2",
            "disqualified" : false
        },
        "placing" : "4",
        "raceRef" : "5525009dc913f92a174f781b",
        "greyhoundRef" : "5517af08f80dcb0000248f87"
    };

    var placing3 = {
        "greyhound" : {
            "name" : "dog1"
        },
        "race" : {
            "distanceMeters" : 500,
            "date" :new Date(),
            "groupLevelName": "Group 3",
            "name" : "race3",
            "disqualified" : false
        },
        "placing" : "5",
        "raceRef" : "5525009dc913f92a174f781c",
        "greyhoundRef" : "5517af08f80dcb0000248f87"
    };

    before(function(done){
        testHelper.setup(function(){
            scoreService = require('../app/ranking/scoreService');
            Ranking.remove({}, function(){
                Score.remove({}, function() {
                    Placing.remove({}, function () {
                        new Placing(placing1).save(function () {
                            new Placing(placing2).save(function () {
                                new Placing(placing3).save(function () {
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    after(function (done) {
        Ranking.remove({}, function(){
            Score.remove({}, function() {
                Placing.remove({}, function () {
                    done();
                });
            });
        });
    });

    describe("#getScoreCreationQuery", function(){
        it("returns correct creation query", function(){
            var pa = {
                criteria: [
                    {field: "placing", "comparator": "=", "value": "1"},
                    {field: "race.groupLevelName", "comparator": "=", "value": "Group 3"},
                    {field: "race.distanceMeters", "comparator": "<", "value": 715}
                ],
                points: 20
            };
            var group = {
                label: "fieldName", field:"fieldField"
            };
            var expected = [
                { $match :{ 'race.groupLevelName': 'Group 3',
                    'race.distanceMeters': { '$lt': 715 },
                    placing: '1'}},
                {$project :{"race": "$race",
                    "placing": "$placing",
                    "name":"$fieldName",
                    "ref": "$fieldField",
                    "points":{$literal: 20},
                    "placingRef":"$_id",
                    "position" :"$placing",
                    "raceName":"$race.name",
                    "raceRef": "$raceRef"
                }}

            ];
            var result = scoreService.getScoreCreationQuery(group,pa);
            assert.deepEqual(result, expected);
        });
    });

    describe("#getScoreCreationQueries", function(){
        it("returns a set of creation queries", function(){
            var pa = {
                criteria: [
                    {field: "placing", "comparator": "=", "value": "1"},
                    {field: "race.groupLevelName", "comparator": "=", "value": "Group 3"},
                    {field: "race.distanceMeters", "comparator": "<", "value": 715}
                ],
                points: 20
            };
            var group = {
                label: "fieldName", field:"fieldField"
            };
            var rs = { pointAllotments: [pa], groupBy: group};
            var expected = [[
                { $match :{ 'race.groupLevelName': 'Group 3',
                    'race.distanceMeters': { '$lt': 715 },
                    placing: '1'}},
                {$project :{"race": "$race",
                    "placing": "$placing",
                    "name":"$fieldName",
                    "ref": "$fieldField",
                    "points":{$literal: 20},
                    "placingRef":"$_id",
                    "position" :"$placing",
                    "raceName":"$race.name",
                    "raceRef": "$raceRef"
                }}

            ]];
            var result = scoreService.getScoreCreationQueries(rs);
            assert.deepEqual(result, expected);
        });
    });

    describe("#createScores", function(){

        after(function (done) {
            Score.remove({}, function() {
                done();
            });
        });

        it("creates a correct set of scores", function(done){
            var rs = {};
            var fp = "createScoreTest";
            var pipelines = [
                [
                { $match :{ 'race.groupLevelName': 'Group 3', "placing": "3"}},
                {$project :{"race": "$race",
                    "placing": "$placing",
                    "name":"$greyhound.name",
                    "ref": "$greyhoundRef",
                    "points":{$literal: 20},
                    "placingRef":"$_id",
                    "position" :"$placing",
                    "raceName":"$race.name"}}
                    ],
                [
                    { $match :{ 'race.groupLevelName': 'Group 3', "placing": "4"}},
                    {$project :{"race": "$race",
                        "placing": "$placing",
                        "name":"$greyhound.name",
                        "ref": "$greyhoundRef",
                        "points":{$literal: 20},
                        "placingRef":"$_id",
                        "position" :"$placing",
                        "raceName":"$race.name"}}
                ]
            ];
            scoreService.createScores(rs, pipelines, fp).then(function(){
                Score.find({fingerPrint: "createScoreTest"}, function(err, res){
                    if (err) {done(err)}
                    assert.equal(res[0].points, 20);
                    assert.equal(res[0].name, "dog1");
                    assert.equal(res[0].ref, "5517af08f80dcb0000248f87");
                    assert.equal(res[0].raceName, "race1");

                    assert.equal(res[1].points, 20);
                    assert.equal(res[1].name, "dog1");
                    assert.equal(res[1].ref, "5517af08f80dcb0000248f87");
                    assert.equal(res[1].raceName, "race2");
                    done();
                });
            });
        });
    });

    describe("#sumScoresIntoRankings", function(){

        before(function(done){
            var score1 = {
                fingerPrint : "sumScoresIntoRankingsTest",
                rankingSystemRef : "rankingSystemTest",
                ref: "5517af08f80dcb0000248f87",
                name: "dog1",
                points: 20,
                placingRef: "placingRef1",
                position: "3",
                raceName: "race1"
            };

            var score2 = {
                fingerPrint : "sumScoresIntoRankingsTest",
                rankingSystemRef : "rankingSystemTest",
                ref: "5517af08f80dcb0000248f87",
                name: "dog1",
                points: 20,
                placingRef: "placingRef1",
                position: "4",
                raceName: "race2"
            };

            new Score(score1).save(function(){
                new Score(score2).save(function(){
                    done();
                });
            });
        });

        after(function (done) {
            Score.remove({}, function() {
                Ranking.remove({}, function(){
                    done();
                });
            });
        });

        it("creates rankings", function(done){
            var rankingSystem = {
                _id : "rankingSystemTest"
            };

            scoreService.sumScoresIntoRankings(rankingSystem, "sumScoresIntoRankingsTest").then(function(){
                Ranking.find({}, function(err, res){
                    if (err){done(err);}
                    assert.equal(res[0].totalPoints, 40);
                    done();
                });
            });
        });
    });

    describe("#createScore", function(){
        after(function (done) {
            Score.remove({}, function() {
                done();
            });
        });

        it("creates a correct score", function(done){
            var rs = {};
            var fp = "createScoreTest";
            var pipeline = [
                { $match :{ 'race.groupLevelName': 'Group 3', 'placing':"3"}},
                {$project :{"race": "$race",
                    "placing": "$placing",
                    "name":"$greyhound.name",
                    "ref": "$greyhoundRef",
                    "points":{$literal: 20},
                    "placingRef":"$_id",
                    "position" :"$placing",
                    "raceName":"$race.name"}}
            ];
            scoreService.createScore(rs, pipeline, fp).then(function(){
                Score.find({fingerPrint: "createScoreTest"}, function(err, res){
                    if (err) {done(err)}
                    assert.equal(res[0].points, 20);
                    assert.equal(res[0].name, "dog1");
                    assert.equal(res[0].position, "3");
                    assert.equal(res[0].ref, "5517af08f80dcb0000248f87");
                    done();
                });
            });
        });
    });

    describe("#generateRankingsFromScores", function(){
        it("can create rankings correctly");
    });
});
