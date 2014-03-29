var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
chai.should();
var expect = chai.expect;
var Greyhound = mongoose.model('Greyhound');
var testHelper = require('./testHelper');

describe("Greyhound", function(){
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        Greyhound.remove({}, function(){
            new Greyhound({"_id" : "53340c2d8e791cd5d7c731d7", "name" : "grey1"}).save();
            new Greyhound({"_id":'531d1f74e407586c2147737b', name:"grey2"}).save();
            new Greyhound({"_id":'531d1f72e407586c21476e49', name:"grey4", sireRef:"53340c2d8e791cd5d7c731d7", damRef:"531d1f74e407586c2147737b"}).save();
            new Greyhound({"_id":'531d1f74e407586c214773df', name:"grey3"}).save(done);
        });
    });

    describe("Get", function(){
        it("many", function(done){
            testHelper.publicSession
                .get('/greyhound/')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.length(4);
                    done();
                });
        });

        it("one by id", function(done){
            testHelper.publicSession
                .get('/greyhound/53340c2d8e791cd5d7c731d7')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("grey1");
                    done();
                });
        });
    });

    describe("Create", function(){
        it("is secured", function(done){
            var body = {name:"createdGrey"};
            testHelper.publicSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with name createdgrey", function(done){
            var body = {name:"createdgrey"};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("createdgrey");
                    done();
                });
        });

        it("lowercases the name", function(done){
            var body = {name:"CreatedGrey"};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("createdgrey");
                    done();
                });
        });

        it("cannot use existing name", function(done){
            var body = {name:"grey1"};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with name createdgrey and empty sireRef", function(done){
            var body = {name:"createdgrey", sireRef: null};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("with name createdgrey and empty sireRef object", function(done){
            var body = {name:"createdgrey", sireRef: {}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with name createdgrey and empty sire object", function(done){
            var body = {name:"createdgrey", sire: {}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("with name createdgrey and sireRef of existingSire", function(done){
            var body = {name:"createdgrey", sireRef: '53340c2d8e791cd5d7c731d7'};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with name createdgrey and sireRef of nonsense", function(done){
            var body = {name:"createdgrey", sireRef: {"no":"sense"}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with name createdgrey and sireRef of grey1 and sire name of creategreysire", function(done){
            var body = {name:"createdgrey", sireRef: '53340c2d8e791cd5d7c731d7', sire:{"name":"creategreysire"}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with name createdgrey and sire with name of blank", function(done){
            var body = {name:"createdgrey", sire: {name : ''}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.should.not.have.property("sireRef");
                    res.body.name.should.equal("createdgrey");
                    done();
                });
        });

        it("with name createdgrey and sire with name of creategreysire", function(done){
            var body = {name:"createdgrey", sire: {name:'creategreysire'}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.should.have.property("sireRef");
                    res.body.name.should.equal("createdgrey");
                    done();
                });
        });

        it("with name createdgrey and sire with name of grey1", function(done){
            var body = {name:"createdgrey", sire: {name:'grey1'}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("createdgrey");
                    res.body.should.have.property("sireRef");
                    res.body.sireRef.should.equal("53340c2d8e791cd5d7c731d7");
                    done();
                });
        });

        it("with name createdgrey and empty damRef", function(done){
            var body = {name:"createdgrey", damRef: null};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("with name createdgrey and empty damRef object", function(done){
            var body = {name:"createdgrey", damRef: {}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with name createdgrey and empty dam object", function(done){
            var body = {name:"createdgrey", dam: {}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("with name createdgrey and damRef of existingdam", function(done){
            var body = {name:"createdgrey", damRef: '53340c2d8e791cd5d7c731d7'};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with name createdgrey and damRef of nonsense", function(done){
            var body = {name:"createdgrey", damRef: {"no":"sense"}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with name createdgrey and damRef of grey1 and dam name of creategreydam", function(done){
            var body = {name:"createdgrey", damRef: '53340c2d8e791cd5d7c731d7', dam:{"name":"creategreydam"}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with name createdgrey and dam with name of blank", function(done){
            var body = {name:"createdgrey", dam: {name : ''}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.should.not.have.property("damRef");
                    res.body.name.should.equal("createdgrey");
                    done();
                });
        });

        it("with name createdgrey and dam with name of creategreydam", function(done){
            var body = {name:"createdgrey", dam: {name:'creategreydam'}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.should.have.property("damRef");
                    res.body.name.should.equal("createdgrey");
                    done();
                });
        });

        it("with name createdgrey and dam with name of grey1", function(done){
            var body = {name:"createdgrey", dam: {name:'grey1'}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("createdgrey");
                    res.body.should.have.property("damRef");
                    res.body.damRef.should.equal("53340c2d8e791cd5d7c731d7");
                    done();
                });
        });


        it("with name createdgrey, sire with name of creategreysire and dam with name of creategreydam", function(done){
            var body = {name:"createdgrey", sire: {name:'creategreysire'}, dam: {name:'creategreydam'}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("createdgrey");
                    res.body.should.have.property("damRef");
                    res.body.should.have.property("sireRef");
                    done();
                });
        });

        it("with name createdgrey, sire with name of existingSire and dam with name of existingDam", function(done){
            var body = {name:"createdgrey", sire: {name:'grey1'}, dam: {name:'grey2'}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("createdgrey");
                    res.body.should.have.property("damRef");
                    res.body.should.have.property("sireRef");
                    res.body.sireRef.should.equal("53340c2d8e791cd5d7c731d7");
                    res.body.damRef.should.equal("531d1f74e407586c2147737b");
                    done();
                });
        });

        it("with name createdgrey and parents as own name", function(done){
            var body = {name:"createdgrey", sire: {name:'createdgrey'}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with name createdgrey and sire and dam of greysire ", function(done){
            var body = {name:"createdgrey", sire: {name:'greysire'}, dam: {name:'greysire'}};
            testHelper.authSession
                .post('/greyhound')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe("Update", function(){
        it("is secured", function(done){
            var body = {name:"createdGrey"};
            testHelper.publicSession
                .put('/greyhound/53340c2d8e791cd5d7c731d7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with name updategrey", function(done){
            var body = {name:"updategrey"};
            testHelper.authSession
                .put('/greyhound/53340c2d8e791cd5d7c731d7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("updategrey");
                    done();
                });
        });

        it("lowercases the name", function(done){
            var body = {name:"UpdateGrey"};
            testHelper.authSession
                .put('/greyhound/53340c2d8e791cd5d7c731d7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("updategrey");
                    done();
                });
        });

        it("cannot use existing name", function(done){
            var body = {name:"grey3"};
            testHelper.authSession
                .put('/greyhound/53340c2d8e791cd5d7c731d7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with name updategrey and sireRef of existingSire", function(done){
            var body = {name:"updategrey", sireRef: '531d1f74e407586c2147737b'};
            testHelper.authSession
                .put('/greyhound/53340c2d8e791cd5d7c731d7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with name updategrey and sireRef of own id", function(done){
            var body = {name:"updategrey", sireRef: '53340c2d8e791cd5d7c731d7'};
            testHelper.authSession
                .put('/greyhound/53340c2d8e791cd5d7c731d7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with name updategrey and sire of own name", function(done){
            var body = {name:"updategrey", sire: {name:"grey1"}};
            testHelper.authSession
                .put('/greyhound/53340c2d8e791cd5d7c731d7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("with name updategrey and dam of own name", function(done){
            var body = {name:"updategrey", dam: {name:"grey1"}};
            testHelper.authSession
                .put('/greyhound/53340c2d8e791cd5d7c731d7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it("add new sire", function(done){
            var body = {name:"updategrey", sire: {name:"greysire"}};
            testHelper.authSession
                .put('/greyhound/53340c2d8e791cd5d7c731d7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("updategrey");
                    res.body.should.have.property("sireRef");
                    done();
                });
        });

        it("add existing sire", function(done){
            var body = {name:"updategrey", sire: {name:"grey3"}};
            testHelper.authSession
                .put('/greyhound/53340c2d8e791cd5d7c731d7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("updategrey");
                    res.body.should.have.property("sireRef");
                    res.body.sireRef.should.equal("531d1f74e407586c214773df");
                    done();
                });
        });

        it("add new dam", function(done){
            var body = {name:"updategrey", dam: {name:"greydam"}};
            testHelper.authSession
                .put('/greyhound/53340c2d8e791cd5d7c731d7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("updategrey");
                    res.body.should.have.property("damRef");
                    done();
                });
        });

        it("add existing dam", function(done){
            var body = {name:"updategrey", dam: {name:"grey2"}};
            testHelper.authSession
                .put('/greyhound/53340c2d8e791cd5d7c731d7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("updategrey");
                    res.body.should.have.property("damRef");
                    res.body.damRef.should.equal("531d1f74e407586c2147737b");
                    done();
                });
        });

        it("name, add new sire and add existing dam", function(done){
            var body = {name:"updategrey", sire: {name:"greysire"}, dam: {name:"grey2"}};
            testHelper.authSession
                .put('/greyhound/53340c2d8e791cd5d7c731d7')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("updategrey");
                    res.body.should.have.property("sireRef");
                    res.body.should.have.property("damRef");
                    res.body.damRef.should.equal("531d1f74e407586c2147737b");
                    done();
                });
        });

    });

    describe("Delete", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .del('/greyhound/53340c2d8e791cd5d7c731d7')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("delete existing grey1", function (done) {
            testHelper.authSession
                .del('/greyhound/53340c2d8e791cd5d7c731d7')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("delete grey1 and grey4 sire is removed", function (done) {
            testHelper.authSession
                .del('/greyhound/53340c2d8e791cd5d7c731d7')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err) {
                    if (err) {
                        throw err;
                    }
                    testHelper.authSession
                        .get('/greyhound/531d1f72e407586c21476e49')
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            }
                            res.body.should.have.property("name");
                            res.body.name.should.equal("grey4");
                            expect(res.body.sireRef).to.equal(null);
                            done();
                        });
                });
        });

        it("delete grey2 and grey4 dam is removed", function (done) {
            testHelper.authSession
                .del('/greyhound/531d1f74e407586c2147737b')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err) {
                    if (err) {
                        throw err;
                    }
                    testHelper.authSession
                        .get('/greyhound/531d1f72e407586c21476e49')
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            }
                            res.body.should.have.property("name");
                            res.body.name.should.equal("grey4");
                            expect(res.body.damRef).to.equal(null);
                            done();
                        });
                });
        });
    });

    afterEach(function(done){
        Greyhound.remove({}, done);
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
