var chai = require('chai');
var assert = chai.assert;
var expressService = require('../app/expressService');

describe("expressService", function(){
    describe("#buildQueryForEqual", function(){
        it("should build an equal query", function(){
            var query = expressService.buildQueryForField("cat=hat", {"hat":"yes"});
            assert.deepEqual(query, {"cat":"yes"});
        });
    });

    describe("#buildQuery", function(){
        it("should build a valid query", function(){
            var query = expressService.buildQuery(["cat=hat"], {"hat":"yes"});
            assert.deepEqual(query, {"cat":"yes"});
        });
        it("should build a valid query", function(){
            var query = expressService.buildQuery(["cat=hat","type=type"], {"hat":"yes"});
            assert.deepEqual(query, {"cat":"yes"});
        });
        it("should build a valid query", function(){
            var query = expressService.buildQuery(["fieldA=paramA","fieldB=paramB"], {"paramA":"valueA", "paramB":"valueB"});
            assert.deepEqual(query, {"fieldA":"valueA", "fieldB": "valueB"});
        });
        it("should build a valid query", function(){
            var query = expressService.buildQuery(["fieldA~paramA"], {"paramA":"valueA"});
            assert.deepEqual(query, {"fieldA": {$regex : "^valueA", $options:"i"}});
        });
        it("should build a or query", function(){
            var query = expressService.buildQuery(["fieldA=paramA||fieldB=paramA"], {"paramA":"valueA"});
            assert.deepEqual(query, {$or: [{"fieldA":"valueA"}, {"fieldB": "valueA"}]});
        });
    });
});
