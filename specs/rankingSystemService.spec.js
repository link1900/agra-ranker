const _ = require('lodash');
const assert = require('assert');
const testHelper = require('./testHelper');
const Placing = require('../app/placing/placing').model;
const RankingSystem = require('../app/ranking/rankingSystem').model;
let rankingSystemService = null;

describe('rankingService', () => {
    before((done) => {
        testHelper.setup(() => {
            Placing.remove({}, () => {
                rankingSystemService = require('../app/ranking/rankingSystemService');
                done();
            });
        });
    });

    describe('#getFinancialYearForDate', () => {
        it('get correct financial year (13-14) for start of 2014', (done) => {
            const date = new Date(2014, 3, 3);
            const result = rankingSystemService.getFinancialYearForDate(date);
            assert(_.isDate(result.start));
            assert(_.isDate(result.end));
            assert.equal(result.start.getFullYear(), 2013);
            assert.equal(result.start.getMonth(), 6);
            assert.equal(result.start.getDate(), 1);
            assert.equal(result.start.getHours(), 0);
            // check end date is 30 of June
            assert.equal(result.end.getFullYear(), 2014);
            assert.equal(result.end.getMonth(), 5);
            assert.equal(result.end.getDate(), 30);
            assert.equal(result.end.getHours(), 23);
            done();
        });

        it('get correct financial year (14-15) for end of 2014', (done) => {
            const date = new Date(2014, 8, 8);
            const result = rankingSystemService.getFinancialYearForDate(date);
            assert(_.isDate(result.start));
            assert(_.isDate(result.end));
            assert.equal(result.start.getFullYear(), 2014);
            assert.equal(result.start.getMonth(), 6);
            assert.equal(result.start.getDate(), 1);
            assert.equal(result.start.getHours(), 0);
            // check end date is 30 of June
            assert.equal(result.end.getFullYear(), 2015);
            assert.equal(result.end.getMonth(), 5);
            assert.equal(result.end.getDate(), 30);
            assert.equal(result.end.getHours(), 23);
            done();
        });
    });

    describe('#getQueryForPointAllotment', () => {
        it('should generate the correct query for criteria', () => {
            const pointAllotment = {
                criteria: [
                    { field: 'placing', comparator: '=', value: '1' },
                    { field: 'someField', comparator: '>=', value: '55' },
                    { field: 'beforeMe', comparator: '<=', value: 22 },
                    { field: 'race.groupLevelName', comparator: '=', value: 'Group 1' },
                    { field: 'distanceMeters', comparator: '<', value: '715' },
                    { field: 'distanceMeters', comparator: '>', value: '515' },
                    { field: 'race.date', comparator: '>=', value: new Date(2011, 5, 5) },
                    { field: 'disqualified', comparator: '!=', value: true }
                ],
                points: 70
            };
            const expectedQuery = {
                placing: '1',
                'race.groupLevelName': 'Group 1',
                someField: { $gte: '55' },
                beforeMe: { $lte: 22 },
                distanceMeters: { $lt: '715', $gt: '515' },
                'race.date': { $gte: new Date(2011, 5, 5) },
                disqualified: { $ne: true }
            };

            const generatedQuery = rankingSystemService.getQueryForPointAllotment(pointAllotment);
            assert.deepEqual(generatedQuery, expectedQuery);
        });
    });

    describe('#convertPlaceHolder', () => {
        it('get correct date for place holder currentFinancialYearStart', (done) => {
            const result = rankingSystemService.convertPlaceHolder('currentFinancialYearStart');
            assert(_.isDate(result));
            done();
        });

        it('get correct date for place holder currentFinancialYearEnd', (done) => {
            const result = rankingSystemService.convertPlaceHolder('currentFinancialYearEnd');
            assert(_.isDate(result));
            done();
        });

        it('get back the value when not a placeholder', (done) => {
            const result = rankingSystemService.convertPlaceHolder('not place holder');
            assert.equal(result, 'not place holder');
            done();
        });
    });

    after((done) => {
        RankingSystem.remove({}, () => {
            Placing.remove({}, () => {
                testHelper.tearDown(done);
            });
        });
    });
});
