var assert = require('assert');
var testHelper = require('./testHelper');

describe("Ranking System", function(){
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        testHelper.loadRankingSystem(done);
    });

    describe("Get", function(){
        it("many", function(done){
            testHelper.publicSession
                .get('/rankingSystem')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert(res.body.length > 0);
                    done();
                });
        });

        it("one by id", function(done){
            testHelper.publicSession
                .get('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.name,"Test Ranking System");
                    done();
                });
        });
    });

    describe("Create", function(){
        it("is secured", function(done){
            var body = {name:"Another Test Ranking System", description: "just another ranking system"};
            testHelper.publicSession
                .post('/rankingSystem')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with valid json", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
                pointAllotments:[
                    {
                        points: 70,
                        criteria: [
                            {field: "placing", "comparator": "=", "value": "1", type: "Text"},
                            {field: "race.date", "comparator": ">=", "value": "currentFinancialYearStart", type: "Preset"},
                            {field: "race.date", "comparator": "<=", "value": "currentFinancialYearEnd", type: "Preset"},
                            {field: "race.groupLevelName", "comparator": "=", "value": "Group 1", type: "Text"},
                            {field: "distanceMeters", "comparator": "<", "value": 715, type: "Number"},
                            {field: "disqualified", "comparator": "=", "value": false, type: "Boolean"}
                        ]
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.name,"Another Test Ranking System");
                    done();
                });
        });

        it("with empty allotment definitions", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
                pointAllotments:[]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("with same name", function(done){
            var body = {name:"Agra Rankings", description: "just another ranking system"};
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with invalid resolution", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "nope"
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with invalid allotment", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
                pointAllotments: "oops"
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with missing allotment points", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
                pointAllotments: [
                    {
                        ignored: ""
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with invalid allotment points", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
                pointAllotments: [
                    {
                        points: "haha"
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with invalid allotment criteria missing field", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
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
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with invalid allotment criteria empty field", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
                pointAllotments: [
                    {
                        points: 70,
                        criteria: [
                            { field : "", "comparator": "=", "value": "1"}
                        ]
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with invalid allotment criteria missing comparator", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
                pointAllotments: [
                    {
                        points: 70,
                        criteria: [
                            { field : "5", "value": "1"}
                        ]
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with invalid allotment criteria invalid comparator", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
                pointAllotments: [
                    {
                        points: 70,
                        criteria: [
                            { field : "5",  "comparator": "nope", "value": "1"}
                        ]
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with invalid allotment criteria missing value", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
                pointAllotments: [
                    {
                        points: 70,
                        criteria: [
                            { field : "5",  "comparator": "="}
                        ]
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with invalid allotment criteria invalid value", function(done){
            var body = {
                name:"Another Test Ranking System",
                description: "just another ranking system",
                equalPositionResolution: "splitPoints",
                pointAllotments: [
                    {
                        points: 70,
                        criteria: [
                            { field : "5",  "comparator": "=", value: ""}
                        ]
                    }
                ]
            };
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("without name", function(done){
            var body = { description: "just another ranking system"};
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("without description", function(done){
            var body = {name:"Another Test Ranking System"};
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("with long description", function(done){
            var body = {description:testHelper.letter1000};
            testHelper.authSession
                .post('/rankingSystem')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Update", function(){
        it("is secured", function(done){
            var body = {name:"Changed Ranking System"};
            testHelper.publicSession
                .put('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with different name", function(done){
            var body = {name:"Changed Ranking System"};
            testHelper.authSession
                .put('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.name,"Changed Ranking System");
                    done();
                });
        });

        it("with different description", function(done){
            var body = {description:"a different description"};
            testHelper.authSession
                .put('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert.equal(res.body.description,"a different description");
                    done();
                });
        });
    });

    describe("Delete", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .del('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("existing system", function (done) {
            testHelper.authSession
                .del('/rankingSystem/5340bfc15c4ac1fdcd47816d')
                .set('Authorization', 'Bearer '+ testHelper.authToken)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    afterEach(function(done){
        testHelper.clearRankingSystems(done);
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
