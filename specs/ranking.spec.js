const testHelper = require('./testHelper');


describe('Ranking', () => {
    before((done) => {
        testHelper.setup(done);
    });

    describe('Get', () => {
        before((done) => {
            testHelper.setupRankingTestData(done);
        });

        after((done) => {
            testHelper.removeRankingData(done);
        });

        it('Rankings', (done) => {
            testHelper.publicSession
                .get('/ranking?rankingSystemRef=54ac8b031ee51022d545c8fc')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err) => {
                    if (err) { throw err; }
                    done();
                });
        });
    });


    after((done) => {
        testHelper.tearDown(done);
    });
});
