process.env.EMAIL_OVERRIDE='email@localhost';
process.env.MONGOHQ_URL='mongodb://localhost/ranker-test';
process.env.PORT = 3001;

require("../server.js");

describe("Server", function() {
    it("be started", function(done){
        done();
    });
});