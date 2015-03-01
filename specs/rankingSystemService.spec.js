var request = require('supertest');
var mongoose = require('mongoose');
var _ = require('lodash');
var chai = require('chai');
var assert = chai.assert;
var testHelper = require('./testHelper');
var Placing = require('../app/placing/placing').model;
var RankingSystem = require('../app/ranking/rankingSystem').model;
var rankingSystemService = null;

describe("rankingService", function(){

    before(function (done) {
        testHelper.setup(function(){
            Placing.remove({}, function(){
                rankingSystemService = require('../app/ranking/rankingSystemService');
                done();
            });
        });
    });

    describe("#getFinancialYearForDate", function() {
        it("get correct financial year (13-14) for start of 2014", function(done){
            var date = new Date(2014, 3, 3);
            var result = rankingSystemService.getFinancialYearForDate(date);
            assert.property(result,'start');
            assert.property(result,'end');
            assert(_.isDate(result.start));
            assert(_.isDate(result.end));
            assert.equal(result.start.getFullYear(), 2013);
            assert.equal(result.start.getMonth(), 6);
            assert.equal(result.start.getDate(), 1);
            assert.equal(result.start.getHours(), 0);
            //check end date is 30 of June
            assert.equal(result.end.getFullYear(), 2014);
            assert.equal(result.end.getMonth(), 5);
            assert.equal(result.end.getDate(), 30);
            assert.equal(result.end.getHours(), 23);
            done();
        });

        it("get correct financial year (14-15) for end of 2014", function(done){
            var date = new Date(2014, 8, 8);
            var result = rankingSystemService.getFinancialYearForDate(date);
            assert.property(result,'start');
            assert.property(result,'end');
            assert(_.isDate(result.start));
            assert(_.isDate(result.end));
            assert.equal(result.start.getFullYear(), 2014);
            assert.equal(result.start.getMonth(), 6);
            assert.equal(result.start.getDate(), 1);
            assert.equal(result.start.getHours(), 0);
            //check end date is 30 of June
            assert.equal(result.end.getFullYear(), 2015);
            assert.equal(result.end.getMonth(), 5);
            assert.equal(result.end.getDate(), 30);
            assert.equal(result.end.getHours(), 23);
            done();
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
                    {field: "race.date", "comparator": ">=", "value": new Date(2011,5,5)},
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
                'race.date' : { '$gte' :  new Date(2011,5,5)},
                'disqualified': { '$ne' : true }
            };

            var generatedQuery = rankingSystemService.getQueryForPointAllotment(pointAllotment);
            assert.deepEqual(generatedQuery, expectedQuery);
        });
    });

    describe("#convertPlaceHolder", function() {
        it("get correct date for place holder currentFinancialYearStart", function(done){
            var result = rankingSystemService.convertPlaceHolder('currentFinancialYearStart');
            assert(_.isDate(result));
            done();
        });

        it("get correct date for place holder currentFinancialYearEnd", function(done){
            var result = rankingSystemService.convertPlaceHolder('currentFinancialYearEnd');
            assert(_.isDate(result));
            done();
        });

        it("get back the value when not a placeholder", function(done){
            var result = rankingSystemService.convertPlaceHolder('not place holder');
            assert.equal(result, 'not place holder');
            done();
        });
    });

    after(function (done) {
        RankingSystem.remove({}, function(){
            Placing.remove({}, function(){
                testHelper.tearDown(done);
            });
        })
    });
});
