var mongoose = require('mongoose');
var assert = require('assert');
var GroupLevel = require('./groupLevel').model;
groupLevelService = require('./groupLevelService');

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
            done();
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

    afterEach(function(done){
        GroupLevel.remove({}, function(){
            done();
        });
    });

});
