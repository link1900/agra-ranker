var mongoose = require('mongoose');
var assert = require('assert');
var testHelper = require('./testHelper');
var GroupLevel = require('../app/groupLevel/groupLevel').model;
var groupLevelService = null;


describe("groupLevelService", function(){
    before(function (done) {
        testHelper.setup(function(){
            groupLevelService = require('../app/groupLevel/groupLevelService');
            done();
        });
    });

    beforeEach(function(done){
        done();
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
        })
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
