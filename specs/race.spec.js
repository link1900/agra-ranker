var assert = require('assert');
var testHelper = require('./testHelper');

describe("Race", function(){
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        testHelper.loadRaces(function(){
            testHelper.loadGreyhounds(done);
        });
    });

    describe("Get", function(){
        it("common distances", function(done){
            testHelper.publicSession
                .get('/distance')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert(res.body.length > 0);
                    assert(res.body.indexOf(515) != -1);
                    assert(res.body.indexOf(715) != -1);
                    done();
                });
        });

        it("many", function(done){
            testHelper.publicSession
                .get('/race')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert(res.body.length > 1);
                    done();
                });
        });

        it("by name", function(done){
            testHelper.publicSession
                .get('/race?name=race1')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.length, 1);
                    done();
                });
        });

        it("by like", function(done){
            testHelper.publicSession
                .get('/race?like=race1')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert(res.body.length === 1);
                    done();
                });
        });

        it("by like ignoring case", function(done){
            testHelper.publicSession
                .get('/race?like=race2')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert(res.body.length === 1);
                    done();
                });
        });

        it("one by id", function(done){
            testHelper.publicSession
                .get('/race/531d1f72e407586c21476ea8')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }

                    assert.equal(res.body.name,"race1");
                    assert.equal(res.body.groupLevelName,"Group 1");
                    assert.equal(res.body.distanceMeters,515);
                    assert.equal(res.body.disqualified,false);
                    done();
                });
        });
    });

    describe("Create", function(){
        it("is secured", function(done){
            var body = {name:"raceCreated"};
            testHelper.publicSession
                .post('/race')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with valid race", function(done){
            var body = {name:"raceCreated",
                date: new Date(),
                "groupLevelName": "Group 1",
                "distanceMeters": 515,
                "disqualified":false};
            testHelper.authSession
                .post('/race')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.name,"raceCreated");
                    assert.equal(res.body.groupLevelName,"Group 1");
                    assert.equal(res.body.distanceMeters,515);
                    assert.equal(res.body.disqualified,false);
                    done();
                });
        });

        it("with existing name and date", function(done){
            var body ={ "name" : "Race3",
                "date": new Date(2014,5,5),
                "groupLevelName":"Group 1",
                "distanceMeters": 515,
                "disqualified":false};
            testHelper.authSession
                .post('/race')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with name empty body", function(done){
            var body = {};
            testHelper.authSession
                .post('/race')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with just name", function(done){
            var body = {name:"raceCreated"};
            testHelper.authSession
                .post('/race')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Update", function(){
        it("is secured", function(done){
            var body = {name:"raceUpdated"};
            testHelper.publicSession
                .put('/race/531d1f72e407586c21476ea8')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with valid race", function(done){
            var body = {name:"raceUpdated",
                date: new Date(),
                "groupLevelName": "Group 1",
                "distanceMeters": 515,
                "disqualified":false};
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.name,"raceUpdated");
                    assert.equal(res.body.groupLevelName,"Group 1");
                    assert.equal(res.body.distanceMeters,515);
                    assert.equal(res.body.disqualified,false);
                    done();
                });
        });

        it("with empty body", function(done){
            var body = {};
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("with just name", function(done){
            var body = {name:"raceUpdated"};
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("with invalid groupLevelName", function(done){
            var body = {name:"raceUpdated",
                date: new Date(),
                "groupLevelName": "heyya",
                "distanceMeters": 515,
                "disqualified":false};
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with no groupLevelName", function(done){
            var body = {name:"raceUpdated",
                date: new Date(),
                "distanceMeters": 515,
                "disqualified":false};
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("with no date", function(done){
            var body = {name:"raceUpdated",
                date: new Date(),
                "groupLevelName": "Group 1",
                "distanceMeters": 515,
                "disqualified":false};
            testHelper.authSession
                .put('/race/531d1f72e407586c21476ea8')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    describe("Delete", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .del('/race/531d1f72e407586c21476ea8')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("delete existing race1", function (done) {
            testHelper.authSession
                .del('/race/531d1f72e407586c21476ea8')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    afterEach(function(done){
        testHelper.clearRaces(done);
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
