process.env.EMAIL_OVERRIDE='email@localhost';
process.env.MONGO_URL='mongodb://localhost/ranker-test';
process.env.PORT = 3001;
process.env.NODE_ENV='test';
process.env.testUrl='http://localhost:3001';
process.env.FIRST_USER_PASSCODE='teststart';
require("../server.js");

describe("Server", function() {
    it("be started", function(done){
        done();
    });
});