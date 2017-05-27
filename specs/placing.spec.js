var assert = require('assert');
var testHelper = require('./testHelper');

describe("Placing", function(){
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        testHelper.loadPlacings(done);
    });

    describe("Get", function(){
        it("many", function(done){
            testHelper.publicSession
                .get('/placing')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert(res.body.length > 2);
                    done();
                });
        });

        it("search by greyhound ref", function(done){
            testHelper.publicSession
                .get('/placing?greyhoundRef=531d1f74e407586c2147737b')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert(res.body.length  === 1);
                    done();
                });
        });

        it("search by race ref", function(done){
            testHelper.publicSession
                .get('/placing?raceRef=531d1f72e407586c21476ea8')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert(res.body.length > 2);
                    done();
                });
        });

        it("search by race ref and greyhound ref", function(done){
            testHelper.publicSession
                .get('/placing?greyhoundRef=531d1f74e407586c2147737b&raceRef=531d1f72e407586c21476ea8')
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
                .get('/placing/531d1f82e407586c21476eb9')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert(res.body.placing === '2');
                    done();
                });
        });
    });

    describe("Create", function(){
        it("is secured", function(done){
            var body = {"placing" : "2", "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c2147737b"};
            testHelper.publicSession
                .post('/placing')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with just placing", function(done){
            var body = {"placing" : "3"};
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with greyhound ref", function(done){
            var body = {"placing" : "3", "raceRef": "531d1f72e407586c21476ea8"};
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with just placing", function(done){
            var body = {"raceRef": "531d1f72e407586c21476ea8",  "greyhoundRef":"531d1f74e407586c214773df"};
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with really high placing", function(done){
            var body = {"placing" : "50", "raceRef": "531d1f72e407586c21476ea8",  "greyhoundRef":"531d1f74e407586c214773df"};
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with really low placing", function(done){
            var body = {"placing" : "0", "raceRef": "531d1f72e407586c21476ea8",  "greyhoundRef":"531d1f74e407586c214773df"};
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with negative placing", function(done){
            var body = {"placing" : "-1", "raceRef": "531d1f72e407586c21476ea8",  "greyhoundRef":"531d1f74e407586c214773df"};
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with invalid race ref", function(done){
            var body = {"placing" : "3", "raceRef": "invalid",  "greyhoundRef":"531d1f74e407586c214773df"};
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with unlinked greyhound ref", function(done){
            var body = {"placing" : "3", "raceRef": "531d1f72e407586c21476ea8",  "greyhoundRef":"531d1f74f507586c214773df"};
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with existing placing", function(done){
            var body = {"placing" : "2", "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c2147737b"};
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with same greyhound different position", function(done){
            var body = {"placing" : "3", "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c2147737b"};
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with complete placing", function(done){
            var body = {"placing" : "5", "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c214773df"};
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert(res.body.placing === "5");
                    assert(res.body.greyhoundRef === "531d1f74e407586c214773df");
                    assert(res.body.raceRef === "531d1f72e407586c21476ea8");
                    assert.notEqual(res.body.race, null);
                    assert.equal(res.body.race._id, "531d1f72e407586c21476ea8");
                    assert.notEqual(res.body.greyhound, null);
                    assert.equal(res.body.greyhound._id, "531d1f74e407586c214773df");
                    done();
                });
        });

        it("with complete placing at the same position", function(done){
            var body = {"placing" : "2", "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c214773df"};
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.placing, "2");
                    assert.equal(res.body.greyhoundRef, "531d1f74e407586c214773df");
                    assert.equal(res.body.raceRef, "531d1f72e407586c21476ea8");
                    done();
                });
        });

        it("with placing of DNF", function(done){
            var body = {"placing" : "DNF", "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c214773df"};
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.placing, "DNF");
                    assert.equal(res.body.greyhoundRef, "531d1f74e407586c214773df");
                    assert.equal(res.body.raceRef, "531d1f72e407586c21476ea8");
                    done();
                });
        });

        it("with complete placing of disqualified", function(done){
            var body = {"placing" : "disqualified", "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c214773df"};
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.placing, "disqualified");
                    assert.equal(res.body.greyhoundRef, "531d1f74e407586c214773df");
                    assert.equal(res.body.raceRef, "531d1f72e407586c21476ea8");
                    done();
                });
        });
    });

    describe("Update", function(){
        it("is secured", function(done){
            var body = {"placing" : "2", "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c2147737b"};
            testHelper.publicSession
                .put('/placing/531d1f82e407586c21476eb9')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("existing placing", function(done){
            var body = {"placing" : "4"};
            testHelper.authSession
                .put('/placing/531d1f82e407586c21476eb9')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.placing, "4");
                    assert.equal(res.body.greyhoundRef, "531d1f74e407586c2147737b");
                    assert.equal(res.body.raceRef, "531d1f72e407586c21476ea8");
                    assert.notEqual(res.body.race, null);
                    assert.equal(res.body.race._id, "531d1f72e407586c21476ea8");
                    assert.notEqual(res.body.greyhound, null);
                    assert.equal(res.body.greyhound._id, "531d1f74e407586c2147737b");
                    done();
                });
        });

        it("greyhoundRef", function(done){
            var body = {"greyhoundRef" : "531d1f72e407586c21476e49"};
            testHelper.authSession
                .put('/placing/531d1f82e407586c21476eb9')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.placing, "2");
                    assert.equal(res.body.greyhoundRef, "531d1f72e407586c21476e49");
                    assert.equal(res.body.raceRef, "531d1f72e407586c21476ea8");
                    assert.notEqual(res.body.greyhound, null);
                    assert.equal(res.body.greyhound.name, "grey4");
                    assert.equal(res.body.greyhound._id, "531d1f72e407586c21476e49");
                    done();
                });
        });

        it("raceRef", function(done){
            var body = {"raceRef" : "531d1f72e407586c21476ec4"};
            testHelper.authSession
                .put('/placing/531d1f82e407586c21476eb9')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.placing, "2");
                    assert.equal(res.body.raceRef, "531d1f72e407586c21476ec4");
                    assert.equal(res.body.race.name, "Race2");
                    done();
                });
        });

        it("cannot change greyhound field", function(done){
            var body = {"greyhound" : {"name":"nope"}};
            testHelper.authSession
                .put('/placing/531d1f82e407586c21476eb9')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.placing, "2");
                    assert.equal(res.body.raceRef, "531d1f72e407586c21476ea8");
                    assert.notEqual(res.body.greyhound, null);
                    assert.equal(res.body.greyhound.name, "grey2");
                    done();
                });
        });

        it("raceRef", function(done){
            var body = {"raceRef" : "531d1f72e407586c21476ec4"};
            testHelper.authSession
                .put('/placing/531d1f82e407586c21476eb9')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.placing, "2");
                    assert.equal(res.body.greyhoundRef, "531d1f74e407586c2147737b");
                    assert.equal(res.body.raceRef, "531d1f72e407586c21476ec4");
                    done();
                });
        });
    });

    describe("Flyweight" , function(){
        it("race flyweight should be update when race is updated", function(done){
            //create a placing
            var body = {"placing" : "8", "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c214773df"};
            var placingId;
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, placingPostRes){
                    if (err){ throw err; }
                    assert.equal(placingPostRes.body.race._id, "531d1f72e407586c21476ea8");
                    placingId = placingPostRes.body._id;

                    var raceBody = {"name": "differentRace"};
                    testHelper.authSession
                        .put('/race/531d1f72e407586c21476ea8')
                        .set('Authorization', 'Bearer '+ testHelper.authToken)
                        .send(raceBody)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(function(err, raceUpdateRes){
                            if (err){ throw err; }
                            assert.equal(raceUpdateRes.body.name, 'differentRace');

                            testHelper.authSession
                                .get('/placing/'+ placingId)
                                .set('Authorization', 'Bearer '+ testHelper.authToken)
                                .set('Accept', 'application/json')
                                .expect('Content-Type', /json/)
                                .expect(200)
                                .end(function(err, res){
                                    if (err){ throw err; }
                                    assert.equal(res.body.race._id, "531d1f72e407586c21476ea8");
                                    assert.equal(res.body.race.name, 'differentRace');
                                    done();
                                });
                        });
                });
        });

        it("greyhound flyweight should be update when greyhound is updated", function(done){
            //create a placing
            var body = {"placing" : "8", "raceRef": "531d1f72e407586c21476ea8", "greyhoundRef":"531d1f74e407586c214773df"};
            var placingId;
            testHelper.authSession
                .post('/placing')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, placingPostRes){
                    if (err){ throw err; }
                    assert.equal(placingPostRes.body.greyhound._id, "531d1f74e407586c214773df");
                    assert.equal(placingPostRes.body.greyhound.name, 'grey3');
                    placingId = placingPostRes.body._id;

                    var greyhoundBody = {"name": "different"};
                    testHelper.authSession
                        .put('/greyhound/531d1f74e407586c214773df')
                        .set('Authorization', 'Bearer '+ testHelper.authToken)
                        .send(greyhoundBody)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(function(err, update2){
                            if (err){ throw err; }
                            assert.equal(update2.body.name, 'DIFFERENT');

                            testHelper.authSession
                                .get('/placing/'+ placingId)
                                .set('Authorization', 'Bearer '+ testHelper.authToken)
                                .set('Accept', 'application/json')
                                .expect('Content-Type', /json/)
                                .expect(200)
                                .end(function(err, res){
                                    if (err){ throw err; }
                                    assert.equal(res.body.greyhound._id, "531d1f74e407586c214773df");
                                    assert.equal(res.body.greyhound.name, 'DIFFERENT');
                                    done();
                                });
                        });
                });
        });
    });

    describe("Delete", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .del('/placing/531d1f82e407586c21476eb9')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("existing", function (done) {
            testHelper.authSession
                .del('/placing/531d1f82e407586c21476eb9')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("greyhound", function(done) {
            testHelper.authSession
                .get('/placing/531d1f82e407586c21476eb9')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);

            testHelper.authSession
                .del('/greyhound/531d1f74e407586c2147737b')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);

            testHelper.authSession
                .get('/placing/531d1f82e407586c21476eb9')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done());
        });

        it("race", function(done){
            testHelper.authSession
                .get('/placing/531d1f82e407586c21476eb9')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);

            testHelper.authSession
                .del('/race/531d1f72e407586c21476ea8')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);

            testHelper.authSession
                .get('/placing/531d1f82e407586c21476eb9')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done());
        });
    });

    afterEach(function(done){
        testHelper.clearPlacings(done);
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
