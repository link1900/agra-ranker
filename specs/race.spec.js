const assert = require('assert');
const testHelper = require('./testHelper');

describe('Race', () => {
    before((done) => {
        testHelper.setup(done);
    });

    beforeEach((done) => {
        testHelper.loadRaces(() => {
            testHelper.loadGreyhounds(done);
        });
    });

    describe('Get', () => {
        it('common distances', (done) => {
            testHelper.publicSession
                .get('/distance')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) { throw err; }
                    assert(res.body.length > 0);
                    assert(res.body.indexOf(515) !== -1);
                    assert(res.body.indexOf(715) !== -1);
                    done();
                });
        });

        it('many', (done) => {
            testHelper.publicSession
                .get('/race')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) { throw err; }
                    assert(res.body.length > 1);
                    done();
                });
        });

        it('by name', (done) => {
            testHelper.publicSession
                .get('/race?name=race1')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) { throw err; }
                    assert.equal(res.body.length, 1);
                    done();
                });
        });

        it('by like', (done) => {
            testHelper.publicSession
                .get('/race?like=race1')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) { throw err; }
                    assert(res.body.length === 1);
                    done();
                });
        });

        it('by like ignoring case', (done) => {
            testHelper.publicSession
                .get('/race?like=race2')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) { throw err; }
                    assert(res.body.length === 1);
                    done();
                });
        });

        it('one by id', (done) => {
            testHelper.publicSession
                .get('/race/531d1f72e407586c21476ea8')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) { throw err; }

                    assert.equal(res.body.name, 'race1');
                    assert.equal(res.body.groupLevelName, 'Group 1');
                    assert.equal(res.body.distanceMeters, 515);
                    assert.equal(res.body.disqualified, false);
                    done();
                });
        });
    });

    describe('Create', () => {
        it('is secured', (done) => {
            const body = { name: 'raceCreated' };
            testHelper.publicSession
                .post('/race')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it('with valid race', (done) => {
            const body = { name: 'raceCreated',
                date: new Date(),
                groupLevelName: 'Group 1',
                distanceMeters: 515,
                disqualified: false };
            testHelper.authSession
                .post('/race')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) { throw err; }
                    assert.equal(res.body.name, 'raceCreated');
                    assert.equal(res.body.groupLevelName, 'Group 1');
                    assert.equal(res.body.distanceMeters, 515);
                    assert.equal(res.body.disqualified, false);
                    done();
                });
        });

        it('with existing name and date', (done) => {
            const body = { name: 'Race3',
                date: new Date(2014, 5, 5),
                groupLevelName: 'Group 1',
                distanceMeters: 515,
                disqualified: false };
            testHelper.authSession
                .post('/race')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('with name empty body', (done) => {
            const body = {};
            testHelper.authSession
                .post('/race')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('with just name', (done) => {
            const body = { name: 'raceCreated' };
            testHelper.authSession
                .post('/race')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe('Update', () => {
        it('is secured', (done) => {
            const body = { name: 'raceUpdated' };
            testHelper.publicSession
                .put('/race/531d1f72e407586c21476ea8')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it('with valid race', (done) => {
            const body = { name: 'raceUpdated',
                date: new Date(),
                groupLevelName: 'Group 1',
                distanceMeters: 515,
                disqualified: false };
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) { throw err; }
                    assert.equal(res.body.name, 'raceUpdated');
                    assert.equal(res.body.groupLevelName, 'Group 1');
                    assert.equal(res.body.distanceMeters, 515);
                    assert.equal(res.body.disqualified, false);
                    done();
                });
        });

        it('with empty body', (done) => {
            const body = {};
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('with just name', (done) => {
            const body = { name: 'raceUpdated' };
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('with invalid groupLevelName', (done) => {
            const body = { name: 'raceUpdated',
                date: new Date(),
                groupLevelName: 'heyya',
                distanceMeters: 515,
                disqualified: false };
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('with no groupLevelName', (done) => {
            const body = { name: 'raceUpdated',
                date: new Date(),
                distanceMeters: 515,
                disqualified: false };
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('with no date', (done) => {
            const body = { name: 'raceUpdated',
                date: new Date(),
                groupLevelName: 'Group 1',
                distanceMeters: 515,
                disqualified: false };
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    describe('Delete', () => {
        it('is secure', (done) => {
            testHelper.publicSession
                .del('/race/531d1f72e407586c21476ea8')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it('delete existing race1', (done) => {
            testHelper.authSession
                .del('/race/531d1f72e407586c21476ea8')
                .set('Authorization', `Bearer ${testHelper.authToken}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    afterEach((done) => {
        testHelper.clearRaces(done);
    });

    after((done) => {
        testHelper.tearDown(done);
    });
});
