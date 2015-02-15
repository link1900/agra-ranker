var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
var assert = chai.assert;
var Placing = require('../app/placing/placing').model;
var Greyhound = require('../app/greyhound/greyhound').model;
var Race = require('../app/race/race').model;
var greyhoundService = null;
var testHelper = require('./testHelper');
var eventService = require('../app/event/eventService');

describe("greyhoundService", function(){
    before(function (done) {
        testHelper.setup(function(){
            greyhoundService = require('../app/greyhound/greyhoundService');
            done();
        });
    });

    before(function(done) {
        var greyhoundAllen = {
            "_id": "54a32fbee39b345cff5841b5",
            "name": "allen deed"
        };

        var greyhoundDeed = {
            "_id": "54a32fbee39b345cff5841b9",
            "name": "deed"
        };

        var greyhoundBob = {
            "_id": "54a32fbee39b345cff5841b8",
            "name": "bob"
        };

        new Greyhound(greyhoundDeed).save(function () {
            new Greyhound(greyhoundBob).save(function () {
                new Greyhound(greyhoundAllen).save(done);
            });
        });
    });

    describe("#findGreyhoundByName", function(){
        it("find greyhound bob using different case", function(done){
            greyhoundService.findGreyhoundByName("boB").then(function(result){
                assert.isNotNull(result);
                assert.equal(result.name, "bob");
                done();
            },done).then(function(){}, done);
        });

        it("do not find greyhound bob using bo", function(done){
            greyhoundService.findGreyhoundByName("bo").then(function(result){
                assert.isNull(result);
                done();
            },done).then(function(){}, done);
        });

        it("find greyhound deed using deed", function(done){
            greyhoundService.findGreyhoundByName("deed").then(function(result){
                assert.isNotNull(result);
                assert.equal(result.name, "deed");
                done();
            },done).then(function(){}, done);
        });

    });

    after(function (done) {
        Greyhound.remove({}, function(res) {
            testHelper.tearDown(done);
        });
    });
});
