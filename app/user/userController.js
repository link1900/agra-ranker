var userController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var User = require('./user').model;
var userStates = require('./user').states;
var notificationService = require('../notification/notificationService');
var mongoService = require('../mongoService');
var helper = require('../helper');
var validator = require('validator');
var cleaner = require('validator');

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
        .then(userController.cleanUser)
        .then(userController.validateUser)
        .then(userController.checkForPassword)
        .then(userController.checkIfUserExists)
        .then(mongoService.savePromise);
    helper.responseFromPromise(res, processChain);
};

userController.grantAccess = function(req, res){
    var processChain = userController.checkIfAccessCanBeGranted(req.model)
        .then(userController.setUserActive)
        .then(userController.sendUserAcceptedEmail)
        .then(mongoService.savePromise);
    helper.responseFromPromise(res, processChain);
};

userController.setUserActive = function(user){
    user.state = 'Active';
    return q(user);
};

userController.checkIfAccessCanBeGranted = function(user){
    if (user.state == "Requested Access"){
        return q(user);
    } else {
        return q.reject("Can only grant access to new users that have requested it");
    }
};

userController.sendUserAcceptedEmail = function(user){
    var subject = "Access request accepted";
    var message = "Your request to join the AGRA Ranker website has been accepted.";
    return notificationService.sendEmail(user.email, subject, message).then(function(){
        return user;
    }, function(failure){
        q.reject(failure);
    });
};

userController.createActiveUser = function(req, res){
    var processChain = userController.newUser(req.body, userStates.active)
        .then(userController.cleanUser)
        .then(userController.validateUser)
        .then(userController.checkForPassword)
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

userController.updateUser = function(req, res){
    var processChain = userController.mergeUpdateRequest(req.body, req.model)
        .then(userController.cleanUser)
        .then(userController.validateUserIsEditable)
        .then(userController.validateUser)
        .then(userController.checkIfUserExists)
        .then(mongoService.savePromise);

    helper.responseFromPromise(res, processChain);
};

userController.mergeUpdateRequest = function(updateRequest, existingEntity){
    delete updateRequest.password;
    return q(_.extend(existingEntity, updateRequest));
};

userController.checkIfUserExists = function(user){
    return mongoService.oneExists(User, {_id: {$ne: user._id}, email: user.email}).then(function(exists){
        if (exists){
            return q.reject('email ' + user.email + " is already used");
        } else {
            return q(user);
        }
    })
};

userController.validateUserIsEditable = function(user){
    if (!_.contains(['Active','Inactive'], user.state)){
        return q.reject("can only edit a user that is active or inactive");
    }

    return q(user);
};

userController.newUser = function(userRequest, startingState){
    var user = userRequest;
    if (startingState != null){
        user.state = startingState;
    }
    return q(new User(user));
};

userController.cleanUser = function(user){
    if (user.email){
        user.email = cleaner.normalizeEmail(user.email);
    }
    if(user.password){
        user.password = cleaner.trim(user.password);
    }
    if(user.firstName){
        user.firstName = cleaner.trim(user.firstName);
    }
    if(user.lastName){
        user.lastName = cleaner.trim(user.lastName);
    }
    return q(user);
};

userController.validateUser = function(user){
    if (validator.isNull(user.email) || !validator.isEmail(user.email)){
        return q.reject("must provide a valid email");
    }

    if(validator.isNull(user.firstName) || !validator.isLength(user.firstName, 0, 50)){
        return q.reject("must provide an first name");
    }

    if(validator.isNull(user.lastName) || !validator.isLength(user.lastName, 0, 50)){
        return q.reject("must provide an last name");
    }

    if (!_.contains(_.values(userStates), user.state)){
        return q.reject("unknown user status of type: " + user.state);
    }

    return q(user);
};

userController.checkForPassword = function(user){
    if (validator.isNull(user.password) || !validator.isLength(user.password, 6, 150)){
        return q.reject("must provide a valid password field");
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

userController.changePassword = function(req, res){
    if (req.body != null && req.body.existingPassword != null && req.body.newPassword != null){
        mongoService.findOneById(User, req.user._id).then(function(currentUser){
            if(currentUser.authenticate(req.body.existingPassword)){
                req.user.password = req.body.newPassword;
                var chain = userController.checkForPassword(req.user).then(mongoService.savePromise);
                helper.responseFromPromise(res, chain);
            } else {
                res.jsonp(400, {"error":'incorrect existing password'});
            }
        }, function(err){
            res.jsonp(400, {"error":err});
        });
    } else {
        res.jsonp(400, {"error":'invalid body'});
    }
};