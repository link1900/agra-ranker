'use strict';
var securityController = module.exports = {};

var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');

securityController.login = function(req, res, next){
    passport.authenticate('local', function(err, user) {
            if (err) {
                return res.send(401, err);
            }
            if (!user) {
                return res.send(401, 'user does not exist');
            }
            return req.logIn(user, function(err) {
                if (err) {
                    return res.send(401, err);
                } else {
                    return res.send(200, user);
                }
            });
        })(req, res, next);
};

securityController.logout = function(req, res){
    req.logout();
    res.send(200, 'logout successful');
};

securityController.checkAuthentication = function(req, res, next){
    if (!req.isAuthenticated()) {
        return res.send(401, 'authentication required');
    }
    return next();
};

