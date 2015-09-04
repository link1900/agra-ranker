var mongoose = require('mongoose');
var _ = require('lodash');
var assert = require('assert');
var testHelper = require('./testHelper');
var mongoService = require('../app/mongoService');

var Schema = mongoose.Schema;

var TestSchema = mongoose.model('MongoServiceTest', new Schema({
    name: { type: String },
    amount: {type: Number}
}));

describe("mongoService", function() {

    before(function (done) {
        testHelper.setup(function () {
            new TestSchema({
                "name" : "dog",
                "amount" : 10
            }).save(function(){
                new TestSchema({
                    "name" : "dog",
                    "amount" : 15
                }).save(function(){
                    new TestSchema({
                        "name" : "cat",
                        "amount" : 20
                    }).save(function(){
                        done();
                    });
                });
            });
        });
    });

    after(function(done){
        TestSchema.remove({},function(){
            done();
        });
    });

    describe("#aggregatePromise", function () {
        it("it can sum the items", function(done){
            var pipeline = [
                { $match :{ 'name': 'dog'}},
                { $project :{"type" : "$name", amount: "$amount"}},
                { $group : { _id : {"ref":"type"}, "total": { $sum: "$amount" } }},
                { $sort: { "total": 1 } }
            ];
            mongoService.aggregatePromise(TestSchema, pipeline).then(function(result){
                assert(result != null);
                assert.equal(result[0].total, 25);
                done();
            },done).catch(function(err){
                done(err);
            });
        });
    });

});