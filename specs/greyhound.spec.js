var request = require('supertest');
var siteUrl = process.env.testUrl;
var mongoose = require('mongoose');
var chai = require('chai');
chai.should();
require("../server.js");
var Greyhound = mongoose.model('Greyhound');

describe("Greyhound", function(){
    beforeEach(function(done){
        new Greyhound({"_id" : "53340c2d8e791cd5d7c731d7", "name" : "grey1"}).save();
        new Greyhound({name:"grey2"}).save();
        new Greyhound({name:"grey3"}).save(done);
    });

    it("Get many", function(done){
        request(siteUrl)
            .get('/greyhound/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                if (err){ throw err; }
                res.body.should.have.length(3);
                done();
            });
    });

    it("Get one by id", function(done){
        request(siteUrl)
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

    afterEach(function(done){
        Greyhound.remove({}, done);
    });

});
