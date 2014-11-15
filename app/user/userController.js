var userController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var User = require('./user').model;
var userStates = require('./user').states;
var AllowedUser = require('./allowedUser').model;
var mongoService = require('../mongoService');
var helper = require('../helper');

userController.setModel = function(req, res, next, id) {
    User.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load ' + id));
        req.model = model;
        return next();
    });
};

userController.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var like = req.param('like');
    var email = req.param('email');
    if (like){
        req.searchQuery = {'email': {'$regex': email}};
    }
    if (email){
        req.searchQuery = {'email': email};
    }
    req.dao = User;
    next();
};

userController.destroy = function(req, res) {
    helper.responseFromPromise(res, mongoService.removePromise(req.model));
};

userController.requestAccess = function(req, res){
    var processChain = userController.newUser(req.body, userStates.requested)
        .then(userController.validateUser)
        .then(userController.checkIfUserExists)
        .then(mongoService.savePromise);
    helper.responseFromPromise(res, processChain);
};

userController.createActiveUser = function(req, res){
    var processChain = userController.newUser(req.body, userStates.active)
        .then(userController.validateUser)
        .then(userController.checkIfUserExists)
        .then(mongoService.savePromise);

    helper.responseFromPromise(res, processChain);
};

userController.inviteUser = function(req, res){

};

/**
 * Takes on the admin role. Can only be used if there are no admins in the system. Requires
 * code to take control.
 */
userController.assumeAdmin = function(req, res){

};

userController.checkIfUserExists = function(user){
    return mongoService.oneExists(User, {email: user.email}).then(function(exists){
        if (exists){
            return q.reject('user with the email ' + user.email + " already exists");
        } else {
            return q(user);
        }
    })
};

userController.newUser = function(userRequest, startingState){
    var user = {email: userRequest.email};
    if (startingState != null){
        user.state = startingState;
    }
    if(userRequest.password){
        user.password= userRequest.password;
    }
    return q(new User(user));
};

userController.validateUser = function(user){
    if(user.email == null){
        return q.reject("must provide an email field");
    }

    if (user.password == null){
        return q.reject("must provide a password field");
    }

    return q(user);

};

userController.me = function(req, res) {
    if (req.user){
        res.jsonp(req.user);
    } else {
        res.jsonp(400, {"error":'no user session found'});
    }

};
