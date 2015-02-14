var userController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var User = require('./user').model;
var userStates = require('./user').states;
var mongoService = require('../mongoService');
var helper = require('../helper');
var userService = require('./userService');

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
    var processChain = userService.newUser(req.body, userStates.requested)
        .then(userService.cleanUser)
        .then(function(user){
            return userService.checkForInvite(user, req.body.inviteToken);
        })
        .then(userService.validateUser)
        .then(userService.checkForPassword)
        .then(userService.checkIfUserExists)
        .then(function(user){
            return userService.checkForPasscode(user, req.body.bootstrap)
        })
        .then(mongoService.savePromise)
        .then(userService.sendNewUserRequestReceivedEmail);
    helper.responseFromPromise(res, processChain);
};

userController.grantAccess = function(req, res){
    var processChain = userService.checkIfAccessCanBeGranted(req.model)
        .then(userService.setUserActive)
        .then(userService.sendUserAcceptedEmail)
        .then(mongoService.savePromise);
    helper.responseFromPromise(res, processChain);
};

userController.createActiveUser = function(req, res){
    var processChain = userService.newUser(req.body, userStates.active)
        .then(userService.cleanUser)
        .then(userService.validateUser)
        .then(userService.checkForPassword)
        .then(userService.checkIfUserExists)
        .then(mongoService.savePromise);

    helper.responseFromPromise(res, processChain);
};

userController.updateUser = function(req, res){
    var processChain = userService.mergeUpdateRequest(req.body, req.model)
        .then(userService.cleanUser)
        .then(userService.validateUserIsEditable)
        .then(userService.validateUser)
        .then(userService.checkIfUserExists)
        .then(mongoService.savePromise);

    helper.responseFromPromise(res, processChain);
};

userController.me = function(req, res) {
    if (req.user){
        res.jsonp(req.user);
    } else {
        res.jsonp(400, {"error":'no user session found'});
    }
};

userController.changePassword = function(req, res){
    if (req.body != null && req.body.existingPassword != null && req.body.newPassword != null){
        mongoService.findOneById(User, req.user._id).then(function(currentUser){
            if(currentUser.authenticate(req.body.existingPassword)){
                req.user.password = req.body.newPassword;
                var chain = userService.checkForPassword(req.user).then(mongoService.savePromise);
                helper.responseFromPromise(res, chain);
            } else {
                res.jsonp(400, {"error":'incorrect existing password'});
            }
        }, function(err){
            res.jsonp(400, {"error":err});
        });
    } else {
        res.jsonp(400, {"error":'required fields are missing'});
    }
};

userController.changePasswordWithToken = function(req, res){
    var token = req.param('userResetToken');
    if (req.body != null && req.body.newPassword != null && token != null){
        var chain = userService.getUserForToken(token).then(function(user){
            user.passwordReset = undefined;
            user.password = req.body.newPassword;
            return user;
        }).then(userService.checkForPassword).then(mongoService.savePromise);

        helper.responseFromPromise(res, chain);
    } else {
        res.jsonp(400, {"error":'required fields are missing'});
    }
};

userController.resetPassword = function(req, res){
    if (req.model != null){
        helper.responseFromPromise(res, userService.resetPassword(req.model));
    } else {
        res.jsonp(400, {"error":'invalid user id'});
    }
};
userController.getBootstrap = function(req, res) {
    helper.responseFromPromise(res, userService.systemRequiresUsers());
};

userController.findUserToken = function(){
    var token = req.param('userResetToken');
    if (token != null){
        helper.responseFromPromise(res, userService.getUserForToken(token));
    } else {
        res.jsonp(400, {"error":'required fields are missing'});
    }
};

userController.forgottenPasswordRequest = function(req, res){
    var forgotten = req.body;
    if (forgotten != null && forgotten.email != null){

        var promise = userService.cleanEmail(forgotten.email)
            .then(userService.validateEmail)
            .then(userService.findUserByEmail)
            .then(function(user){
            if (user != null){
                return userService.resetPassword(user).then(function(){
                    return q({result: 'success'});
                });
            } else {
                return q({result: 'success'});
            }
        });

        helper.responseFromPromise(res, promise);
    } else {
        res.jsonp(400, {"error":'invalid email'});
    }
};