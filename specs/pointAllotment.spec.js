var request = require('supertest');
var mongoose = require('mongoose');
var _ = require('lodash');
var assert = require('chai').assert;
var testHelper = require('./testHelper');
var pointAllotmentController = require('../app/controllers/pointAllotmentController');
var PointAllotment = mongoose.model('PointAllotment');
var Placing = require('../app/placing/placing').model;

describe("Point Allotments", function(){
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        testHelper.loadPointAllotments(done);
    });

    describe("Get", function(){
        it("single point allotment by id", function(done){
            testHelper.publicSession
                .get('/pointAllotment/540198de8bbd09f6ab7f49da')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ console.log(res); throw err; }
                    assert.equal(res.body.points, 70);
                    done();
                });
        });

        it("many", function(done){
            testHelper.publicSession
                .get('/pointAllotment')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ console.log(res); throw err; }
                    assert(res.body.length > 1);
                    done();
                });
        });

        it("search by valid ranking system ref", function(done){
            testHelper.publicSession
                .get('/pointAllotment?rankingSystemRef=53412feb5c4ac1fdcd4781ff')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ console.log(res); throw err; }
                    assert.equal(res.body.length, 2);
                    done();
                });
        });

        it("search by valid greyhound ref", function(done){
            testHelper.publicSession
                .get('/pointAllotment?greyhoundRef=531d1f74e407586c2147737b')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ console.log(res); throw err; }
                    assert.equal(res.body.length, 1);
                    done();
                });
        });

        it("search by invalid greyhound ref", function(done){
            testHelper.publicSession
                .get('/pointAllotment?greyhoundRef=222')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("search by invalid ranking system ref", function(done){
            testHelper.publicSession
                .get('/pointAllotment?rankingSystemRef=333')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("post /pointAllotment", function(){
        it("is secured", function(done){
            testHelper.publicSession
                .post('/pointAllotment?rankingSystemRef=53412feb5c4ac1fdcd4781ff')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("generates point allotments", function(done){
            testHelper.authSession
                .post('/pointAllotment?rankingSystemRef=53412feb5c4ac1fdcd4781ff')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.created, 1);
                    done();
                });
        });
    });

    describe("PointAllotmentController", function() {
        describe("#allocatePointAllotment", function() {
            it("get one allotment for place", function(done) {
                var pointAllotment ={
                    criteria: [
                        {field: "placing", "comparator": "=", "value": "5"},
                        {field: "race.groupLevel.name", "comparator": "=", "value": "Group 1"},
                        {field: "race.distanceMeters", "comparator": "<", "value": 715},
                        {field: "race.disqualified", "comparator": "=", "value": false}
                    ],
                    points: 10
                };

                var rankingSystem = {
                    _id: '54196ff01405add1d0b713bb'
                };
                var placing = {
                    "placing" : "5",
                    "raceRef": "531d1f72e407586c21476ea8",
                    "race": {
                        "name" : "race1",
                        "date": new Date(),
                        "groupLevelRef":"531d1f72e407586c21476ef7",
                        "groupLevel" : {"name" : "Group 1", "level":1},
                        "distanceMeters": 515,
                        "disqualified":false},
                    "greyhoundRef":"531d1f74e407586c2147737b"
                };
                new Placing(placing).save(function(err, res){
                    pointAllotmentController.allocatePointAllotment(rankingSystem, pointAllotment).then(function(){
                        PointAllotment.find({points:10}, function(err, results){
                            assert.equal(results.length, 1);
                            done();
                        });
                    });
                });
            });
        });

        describe("#getQueryForPointAllotment", function() {
            it('should generate the correct query for criteria', function(){
                var pointAllotment ={
                    criteria: [
                        {field: "placing", "comparator": "=", "value": "1"},
                        {field: "someField", "comparator": ">=", "value": "55"},
                        {field: "beforeMe", "comparator": "<=", "value":22},
                        {field: "race.groupLevel.name", "comparator": "=", "value": "Group 1"},
                        {field: "distanceMeters", "comparator": "<", "value": "715"},
                        {field: "distanceMeters", "comparator": ">", "value": "515"},
                        {field: "disqualified", "comparator": "!=", "value": true}
                    ],
                    points: 70
                };
                var expectedQuery = {
                    'placing': '1',
                    'race.groupLevel.name': 'Group 1',
                    'someField': { '$gte': "55"},
                    'beforeMe': { '$lte': 22},
                    'distanceMeters': { '$lt': '715', '$gt': '515' },
                    'disqualified': { '$ne' : true }
                };

                var generatedQuery = pointAllotmentController.getQueryForPointAllotment(pointAllotment);
                assert.deepEqual(generatedQuery, expectedQuery);
            });
        });

        describe("#convertPlaceHolder", function() {
            it("get correct date for place holder ##currentFinancialYear.start", function(done){
                var result = pointAllotmentController.convertPlaceHolder('##currentFinancialYear.start');
                assert(_.isDate(result));
                done();
            });

            it("get correct date for place holder ##currentFinancialYear.end", function(done){
                var result = pointAllotmentController.convertPlaceHolder('##currentFinancialYear.end');
                assert(_.isDate(result));
                done();
            });

            it("get back the value when not a placeholder", function(done){
                var result = pointAllotmentController.convertPlaceHolder('not place holder');
                assert.equal(result, 'not place holder');
                done();
            });
        });


        describe("#getFinancialYearForDate", function() {
            it("get correct financial year (13-14) for start of 2014", function(done){
                var date = new Date(2014, 3, 3);
                var result = pointAllotmentController.getFinancialYearForDate(date);
                assert.property(result,'start');
                assert.property(result,'end');
                assert(_.isDate(result.start));
                assert(_.isDate(result.end));
                assert.equal(result.start.getFullYear(), 2013);
                assert.equal(result.start.getMonth(), 7);
                assert.equal(result.start.getDate(), 1);
                assert.equal(result.start.getHours(), 0);
                //check end date is 31 of June
                assert.equal(result.end.getFullYear(), 2014);
                assert.equal(result.end.getMonth(), 6);
                assert.equal(result.end.getDate(), 31);
                assert.equal(result.end.getHours(), 23);
                done();
            });

            it("get correct financial year (14-15) for end of 2014", function(done){
                var date = new Date(2014, 8, 8);
                var result = pointAllotmentController.getFinancialYearForDate(date);
                assert.property(result,'start');
                assert.property(result,'end');
                assert(_.isDate(result.start));
                assert(_.isDate(result.end));
                assert.equal(result.start.getFullYear(), 2014);
                assert.equal(result.start.getMonth(), 7);
                assert.equal(result.start.getDate(), 1);
                assert.equal(result.start.getHours(), 0);
                //check end date is 31 of June
                assert.equal(result.end.getFullYear(), 2015);
                assert.equal(result.end.getMonth(), 6);
                assert.equal(result.end.getDate(), 31);
                assert.equal(result.end.getHours(), 23);
                done();
            });
        });
    });
    afterEach(function(done){
        testHelper.clearPointAllotments(done);
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
