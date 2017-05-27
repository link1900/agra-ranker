const mongoose = require('mongoose');
const assert = require('assert');
const testHelper = require('./testHelper');
const mongoService = require('../app/mongoService');

const Schema = mongoose.Schema;

const TestSchema = mongoose.model('MongoServiceTest', new Schema({
    name: { type: String },
    amount: { type: Number }
}));

describe('mongoService', () => {
    before((done) => {
        testHelper.setup(() => {
            new TestSchema({
                name: 'dog',
                amount: 10
            }).save(() => {
                new TestSchema({
                    name: 'dog',
                    amount: 15
                }).save(() => {
                    new TestSchema({
                        name: 'cat',
                        amount: 20
                    }).save(() => {
                        done();
                    });
                });
            });
        });
    });

    after((done) => {
        TestSchema.remove({}, () => {
            done();
        });
    });

    describe('#aggregatePromise', () => {
        it('it can sum the items', (done) => {
            const pipeline = [
                { $match: { name: 'dog' } },
                { $project: { type: '$name', amount: '$amount' } },
                { $group: { _id: { ref: 'type' }, total: { $sum: '$amount' } } },
                { $sort: { total: 1 } }
            ];
            mongoService.aggregatePromise(TestSchema, pipeline).then((result) => {
                assert(result != null);
                assert.equal(result[0].total, 25);
                done();
            }, done).catch((err) => {
                done(err);
            });
        });
    });
});
