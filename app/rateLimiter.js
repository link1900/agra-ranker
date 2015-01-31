var rateLimiter = module.exports = {};

var mongoose = require('mongoose');
var moment = require('moment');
var db = mongoose.connection.db;

var ExpressBrute = require('express-brute');
var MongoStore = require('express-brute-mongo');

rateLimiter.store = new MongoStore(function (ready) {
    ready(db.collection('bruteforce-store'));
});

rateLimiter.failure = function (req, res, next, nextValidRequestDate) {
    res.jsonp(429, {error: "You've made too many attempts in a short period of time, please try again "+moment(nextValidRequestDate).fromNow(),
        nextValidRequestDate: nextValidRequestDate});
};

rateLimiter.limitedAccess = new ExpressBrute(rateLimiter.store,{
    freeRetries: 10000,
    proxyDepth: 1,
    minWait: 500, // 500 mills
    maxWait: 15*60*1000, // 15 mins
    lifetime: 60*60, //1 hour
    failCallback: rateLimiter.failure
});