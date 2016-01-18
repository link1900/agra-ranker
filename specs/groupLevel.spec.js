var assert = require('assert');
var testHelper = require('./testHelper');

describe("Group Level", function(){
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        testHelper.loadGroupLevels(done);
    });

    describe("Get", function(){
        it("many", function(done){
            testHelper.publicSession
                .get('/groupLevel')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert(res.body.length > 2);
                    done();
                });
        });

        it("one by id", function(done){
            testHelper.publicSession
                .get('/groupLevel/531d1f72e407586c21476ef7')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert(res.body.name === "Group 1");
                    done();
                });
        });
    });

    describe("Create", function(){
        it("is secured", function(done){
            var body = {name:"raceCreated"};
            testHelper.publicSession
                .post('/groupLevel')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with name Group Created", function(done){
            var body = {name:"Group Created"};
            testHelper.authSession
                .post('/groupLevel')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert(res.body.name === "Group Created");
                    done();
                });
        });

        it("with existing name", function(done){
            var body = {name:"Group 1"};
            testHelper.authSession
                .post('/groupLevel')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Update", function(){
        it("is secured", function(done){
            var body = {name:"Group Updated"};
            testHelper.publicSession
                .put('/groupLevel/531d1f72e407586c21476ef7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with name Group Updated", function(done){
            var body = {name:"Group Updated"};
            testHelper.authSession
                .put('/groupLevel/531d1f72e407586c21476ef7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    assert(res.body.name === "Group Updated");
                    done();
                });
        });

        it("with existing name", function(done){
            var body = {name:"Group 2"};
            testHelper.authSession
                .put('/groupLevel/531d1f72e407586c21476ef7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Delete", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .del('/groupLevel/531d1f72e407586c21476ef7')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("delete existing group 1", function (done) {
            testHelper.authSession
                .del('/groupLevel/531d1f72e407586c21476ef7')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    afterEach(function(done){
        testHelper.clearGroupLevels(done);
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
