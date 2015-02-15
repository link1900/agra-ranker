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
    var changeModel;
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

        var greyhoundChange = {
            "_id": "54a32fbee39b345cff5841c8",
            "name": "change me"
        };
        changeModel = new Greyhound(greyhoundChange);
        changeModel.save(function(){
            new Greyhound(greyhoundDeed).save(function () {
                new Greyhound(greyhoundBob).save(function () {
                    new Greyhound(greyhoundAllen).save(done);
                });
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

    describe("#validateSireRef", function() {
        it("should validate a greyhounds sire ref", function (done) {
            var grey = new Greyhound({"name":"james", "sireRef": "54a32fbee39b345cff5841b8"});
            greyhoundService.validateSireRef(grey).then(function (result) {
                assert.isNotNull(result);
                assert.equal(result.name, "james");
                done();
            }, done).then(function () {}, done);
        });

        it("should validate a greyhounds sire ref", function (done) {
            var grey = new Greyhound({"name":"james", "sireRef": "54a32fbee39b345cff5841b8", "damRef": "54a32fbee39b345cff5841b8"});
            greyhoundService.validateSireRef(grey).then(function (result) {
                done(new Error("this should not pass"));
            }, function(){done();}).then(function () {}, done);
        });

        it("should reject a greyhounds sire ref is invalid", function (done) {
            var grey = new Greyhound({"name":"james", "sireRef": "oh no"});
            greyhoundService.validateSireRef(grey).then(function (result) {
                done(new Error("this should not pass"));
            }, function(){done();}).then(function () {}, done);
        });

        it("should reject a greyhounds sire ref if it is the greyhounds id", function (done) {
            var grey = new Greyhound({_id: "54a32fbee39b345cff5841b3", "name":"james", "sireRef": "54a32fbee39b345cff5841b3"});
            greyhoundService.validateSireRef(grey).then(function (result) {
                done(new Error("this should not pass"));
            }, function(){done();}).then(function () {}, done);
        });

        it("should reject a greyhounds sire ref cannot be found", function (done) {
            var grey = new Greyhound({"name":"james", "sireRef": "54a32fbee39b345cff5841b1"});
            greyhoundService.validateSireRef(grey).then(function (result) {
                done(new Error("this should not pass"));
            }, function(){done();}).then(function () {}, done);
        });
    });

    describe("#validateDamRef", function() {
        it("should validate a greyhounds dam ref", function (done) {
            var grey = new Greyhound({"name":"james", "damRef": "54a32fbee39b345cff5841b8"});
            greyhoundService.validateDamRef(grey).then(function (result) {
                assert.isNotNull(result);
                assert.equal(result.name, "james");
                done();
            }, done).then(function () {}, done);
        });

        it("should validate a greyhounds dam ref", function (done) {
            var grey = new Greyhound({"name":"james", "sireRef": "54a32fbee39b345cff5841b8", "damRef": "54a32fbee39b345cff5841b8"});
            greyhoundService.validateDamRef(grey).then(function (result) {
                done(new Error("this should not pass"));
            }, function(){done();}).then(function () {}, done);
        });

        it("should reject a greyhounds dam ref is invalid", function (done) {
            var grey = new Greyhound({"name":"james", "damRef": "oh no"});
            greyhoundService.validateDamRef(grey).then(function (result) {
                done(new Error("this should not pass"));
            }, function(){done();}).then(function () {}, done);
        });

        it("should reject a greyhounds dam ref if it is the greyhounds id", function (done) {
            var grey = new Greyhound({_id: "54a32fbee39b345cff5841b3", "name":"james", "damRef": "54a32fbee39b345cff5841b3"});
            greyhoundService.validateDamRef(grey).then(function (result) {
                done(new Error("this should not pass"));
            }, function(){done();}).then(function () {}, done);
        });

        it("should reject a greyhounds dam ref cannot be found", function (done) {
            var grey = new Greyhound({"name":"james", "damRef": "54a32fbee39b345cff5841b1"});
            greyhoundService.validateDamRef(grey).then(function (result) {
                done(new Error("this should not pass"));
            }, function(){done();}).then(function () {}, done);
        });
    });

    describe("#validateGreyhoundIsNew", function() {
        it("should reject if greyhound exists", function (done) {
            var grey = new Greyhound({"name": "bob"});
            greyhoundService.validateGreyhoundIsNew(grey).then(function (result) {
                done(new Error("this should not pass"));
            }, function () {
                done();
            }).then(function () {
            }, done);
        });

        it("should fail when passed and an existing greyhound id", function (done) {
            var grey = new Greyhound({"_id":"54a32fbee39b345cff5841b8","name": "bob"});
            greyhoundService.validateGreyhoundIsNew(grey).then(function (result) {
                done(new Error("this should not pass"));
            }, function () {
                done();
            }).then(function () {
            }, done);
        });

        it("should pass if it is new", function (done) {
            var grey = new Greyhound({"name": "totes new"});
            greyhoundService.validateGreyhoundIsNew(grey).then(function (result) {
                assert.isNotNull(result);
                assert.equal(result.name, "totes new");
                done();
            }, done).then(function () {
            }, done);
        });
    });

    describe("#createGreyhoundFromJson", function() {
        it("should pass if it is new", function (done) {
            greyhoundService.createGreyhoundFromJson({"name": "really new"}).then(function (result) {
                assert.isNotNull(result);
                assert.equal(result.name, "really new");
                done();
            }, done).then(function () {
            }, done);
        });

        it("should reject if greyhound exists", function (done) {
            greyhoundService.createGreyhoundFromJson({"name": "bob"}).then(function (result) {
                done(new Error("this should not pass"));
            }, function () {
                done();
            }).then(function () {
            }, done);
        });
    });

    describe("#updateGreyhoundFromJson", function() {
        it("should change the name", function (done) {
            greyhoundService.updateGreyhoundFromJson(changeModel, {"name": "new name"}).then(function (result) {
                assert.isNotNull(result);
                assert.equal(result.name, "new name");
                done();
            }, done).then(function () {}, done);
        });

        it("set sire to bob", function (done) {
            greyhoundService.updateGreyhoundFromJson(changeModel, {"name": "new name", sireRef: "54a32fbee39b345cff5841b8"}).then(function (result) {
                assert.isNotNull(result);
                assert.equal(result.name, "new name");
                assert.equal(result.sireRef, "54a32fbee39b345cff5841b8");
                done();
            }, done).then(function () {}, done);
        });

        it("should reject if greyhound exists", function (done) {
            greyhoundService.updateGreyhoundFromJson(changeModel, {"name": "bob"}).then(function (result) {
                done(new Error("this should not pass"));
            }, function () {done();}).then(function () {}, done);
        });
    });


    after(function (done) {
        Greyhound.remove({}, function(res) {
            testHelper.tearDown(done);
        });
    });
});
