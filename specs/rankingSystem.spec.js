const assert = require('assert');
const testHelper = require('./testHelper');

describe('Ranking System', () => {
    before((done) => {
        testHelper.setup(done);
    });

    beforeEach((done) => {
        testHelper.loadRankingSystem(done);
    });

    describe('Get', () => {
        it('many', (done) => {
            testHelper.publicSession
                .get('/rankingSystem')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) { throw err; }
                    assert(res.body.length > 0);
                    done();
                });
        });

        it('one by id', (done) => {
            testHelper.publicSession
                .get('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) { throw err; }
                    assert.equal(res.body.name, 'Test Ranking System');
                    done();
                });
        });
    });

    describe('Create', () => {
        it('is secured', (done) => {
            const body = { name: 'Another Test Ranking System', description: 'just another ranking system' };
            testHelper.publicSession
                .post('/rankingSystem')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it('with valid json', (done) => {
            const body = {
                name: 'Another Test Ranking System',
                description: 'just another ranking system',
                equalPositionResolution: 'splitPoints',
                pointAllotments: [
                    {
                        points: 70,
                        criteria: [
                            { field: 'placing', comparator: '=', value: '1', type: 'Text' },
                            { field: 'race.date', comparator: '>=', value: 'currentFinancialYearStart', type: 'Preset' },
                            { field: 'race.date', comparator: '<=', value: 'currentFinancialYearEnd', type: 'Preset' },
                            { field: 'race.groupLevelName', comparator: '=', value: 'Group 1', type: 'Text' },
                            { field: 'distanceMeters', comparator: '<', value: 715, type: 'Number' },
                            { field: 'disqualified', comparator: '=', value: false, type: 'Boolean' }
                        ]
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) { throw err; }
                    assert.equal(res.body.name, 'Another Test Ranking System');
                    done();
                });
        });

        it('with empty allotment definitions', (done) => {
            const body = {
                name: 'Another Test Ranking System',
                description: 'just another ranking system',
                equalPositionResolution: 'splitPoints',
                pointAllotments: []
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('with same name', (done) => {
            const body = { name: 'GCA Rankings', description: 'just another ranking system' };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('with invalid resolution', (done) => {
            const body = {
                name: 'Another Test Ranking System',
                description: 'just another ranking system',
                equalPositionResolution: 'nope'
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('with invalid allotment', (done) => {
            const body = {
                name: 'Another Test Ranking System',
                description: 'just another ranking system',
                equalPositionResolution: 'splitPoints',
                pointAllotments: 'oops'
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('with missing allotment points', (done) => {
            const body = {
                name: 'Another Test Ranking System',
                description: 'just another ranking system',
                equalPositionResolution: 'splitPoints',
                pointAllotments: [
                    {
                        ignored: ''
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('with invalid allotment points', (done) => {
            const body = {
                name: 'Another Test Ranking System',
                description: 'just another ranking system',
                equalPositionResolution: 'splitPoints',
                pointAllotments: [
                    {
                        points: 'haha'
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('with invalid allotment criteria missing field', (done) => {
            const body = {
                name: 'Another Test Ranking System',
                description: 'just another ranking system',
                equalPositionResolution: 'splitPoints',
                pointAllotments: [
                    {
                        points: 70,
                        criteria: [
                            {}
                        ]
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('with invalid allotment criteria empty field', (done) => {
            const body = {
                name: 'Another Test Ranking System',
                description: 'just another ranking system',
                equalPositionResolution: 'splitPoints',
                pointAllotments: [
                    {
                        points: 70,
                        criteria: [
                            { field: '', comparator: '=', value: '1' }
                        ]
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('with invalid allotment criteria missing comparator', (done) => {
            const body = {
                name: 'Another Test Ranking System',
                description: 'just another ranking system',
                equalPositionResolution: 'splitPoints',
                pointAllotments: [
                    {
                        points: 70,
                        criteria: [
                            { field: '5', value: '1' }
                        ]
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('with invalid allotment criteria invalid comparator', (done) => {
            const body = {
                name: 'Another Test Ranking System',
                description: 'just another ranking system',
                equalPositionResolution: 'splitPoints',
                pointAllotments: [
                    {
                        points: 70,
                        criteria: [
                            { field: '5', comparator: 'nope', value: '1' }
                        ]
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('with invalid allotment criteria missing value', (done) => {
            const body = {
                name: 'Another Test Ranking System',
                description: 'just another ranking system',
                equalPositionResolution: 'splitPoints',
                pointAllotments: [
                    {
                        points: 70,
                        criteria: [
                            { field: '5', comparator: '=' }
                        ]
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('with invalid allotment criteria invalid value', (done) => {
            const body = {
                name: 'Another Test Ranking System',
                description: 'just another ranking system',
                equalPositionResolution: 'splitPoints',
                pointAllotments: [
                    {
                        points: 70,
                        criteria: [
                            { field: '5', comparator: '=', value: '' }
                        ]
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('without name', (done) => {
            const body = { description: 'just another ranking system' };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('without description', (done) => {
            const body = { name: 'Another Test Ranking System' };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('with long description', (done) => {
            const body = { description: testHelper.letter1000 };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe('Update', () => {
        it('is secured', (done) => {
            const body = { name: 'Changed Ranking System' };
            testHelper.publicSession
                .put('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it('with different name', (done) => {
            const body = { name: 'Changed Ranking System' };
            testHelper.authSession
                .put('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) { throw err; }
                    assert.equal(res.body.name, 'Changed Ranking System');
                    done();
                });
        });

        it('with different description', (done) => {
            const body = { description: 'a different description' };
            testHelper.authSession
                .put('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) { throw err; }
                    assert.equal(res.body.description, 'a different description');
                    done();
                });
        });
    });

    describe('Delete', () => {
        it('is secure', (done) => {
            testHelper.publicSession
                .del('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it('existing system', (done) => {
            testHelper.authSession
                .del('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    afterEach((done) => {
        testHelper.clearRankingSystems(done);
    });

    after((done) => {
        testHelper.tearDown(done);
    });
});
