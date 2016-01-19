'use strict';
var securityController = module.exports = {};

var passport = require('passport');
var userStates = require('./user').states;

securityController.login = function(req, res, next){
    passport.authenticate('local', function(err, user) {
            if (err) {
                return res.jsonp(401, {"error": err});
            }
            if (!user) {
                return res.jsonp(401, {"error": 'incorrect login details'});
            }
            if(user.state != userStates.active){
                return res.jsonp(401, {"error": 'cannot login as this user is ' + user.state});
            }
            return req.logIn(user, function(err) {
                if (err) {
                    return res.jsonp(401, {"error": err});
                } else {
                    return res.jsonp(200, user);
                }
            });
        })(req, res, next);
};

securityController.logout = function(req, res){
    req.logout();
    res.jsonp(200, {"message": "logout successful"});
};

securityController.checkAuthentication = function(req, res, next){
    if (!req.isAuthenticated()) {
        return res.jsonp(401, {error: 'authentication required'});
    }
    return next();
};

