var mongoose = require('mongoose');
var assert = require('assert');
var GroupLevel = require('./groupLevel').model;
var groupLevelService = require('./groupLevelService');
var eventService = require('../event/eventService');

var group1;

describe("groupLevelService", function(){

    before(function(done){
        if (mongoose.connection.db) {
            return done();
        } else {
            mongoose.connect('mongodb://localhost/ranker_test', done);
        }
    });

    before(function(done){
        GroupLevel.remove({}, function(){
            group1 = new GroupLevel({name:"Group 1"});
            group1.save(function(){
                done();
            });
        });
    });

    describe('#createGroupLevelFromJson', function(){
        it("should create a group level", function(done){
            var body = {name:"Group Created"};
            groupLevelService.createGroupLevelFromJson(body).then(function(result){
                assert.notEqual(result, null);
                assert.equal(result.name,"Group Created");
                done();
            }).then(function(){}, done);
        });
    });

    describe('#updateGroupLevelFromJson', function(){
        it("should update a group level", function(done){
            var body = {name:"Group Update"};
            groupLevelService.updateGroupLevelFromJson(group1, body).then(function(result){
                assert.notEqual(result, null);
                assert.equal(result.name,"Group Update");
                done();
            }).then(function(){}, done);
        });
    });

    describe('#remove', function(){
        it("should remove a group level", function(done){
            groupLevelService.remove(group1).then(function(){
                done();
            }).then(function(){}, done);
        });
    });

    describe("events", function() {
        it("should issue create event on creation", function(done){
            eventService.addListener("testCreate","Created GroupLevel", function(){
                done();
            });
            var body = {name:"Group Created"};
            groupLevelService.createGroupLevelFromJson(body).then(function(){}, done);
        });

        it("should issue update event on update", function(done){
            eventService.addListener("testUpdate","Updated GroupLevel", function(){
                done();
            });
            var body = {name:"Group Update"};
            groupLevelService.updateGroupLevelFromJson(group1, body).then(function(){}, done);
        });

        it("should issue delete event on delete", function(done){
            eventService.addListener("testDelete","Deleted GroupLevel", function(){
                done();
            });
            groupLevelService.remove(group1).then(function(){}, done);
        });

        afterEach(function(){
            eventService.removeListenerByName("testCreate");
            eventService.removeListenerByName("testUpdate");
            eventService.removeListenerByName("testDelete");
            eventService.removeListenerByName("testBatch");
        });
    });


    afterEach(function(done){
        GroupLevel.remove({}, function(){
            done();
        });
    });

});
