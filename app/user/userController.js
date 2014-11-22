var userController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var uuid = require('node-uuid');
var moment = require('moment');
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
    var email = notificationService.createNewEmail();
    email.addTo(user.email);
    email.setSubject("Welcome to the -siteName-");
    email.setText("Your request to join the -siteName- website has been accepted. You can now login at -siteUrl-");
    return notificationService.sendEmail(email).then(function(){
        return user;
    });
};

userController.sendUserPasswordReset = function(user){
    var email = notificationService.createNewEmail();

    email.addTo(user.email);
    email.setSubject("Password change request");
    email.addSubstitution('-email-', user.email);
    email.addSubstitution('-passwordLink-', notificationService.siteUrl + "/user/passwordReset/#/" + user.passwordReset.token);
    email.setText("A request to change the password for your -siteName- account -email- has been received. Please follow the link below to set a new password.\n-passwordLink-\n\n" +
        "You received this email because you or someone else has requested a password change.\n If you do not wish to change your password you can ignore this email.\n" +
        "For your security, this link is only valid for 24 hours from the time of your request. Also note that if you requested to change your password multiple times, only the link contained in the most recent email will be valid. If the link does not work, please resubmit your password change request.");


    return notificationService.sendEmail(email).then(function(){
        return user;
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
        res.jsonp(400, {"error":'required fields are missing'});
    }
};

userController.changePasswordWithToken = function(req, res){
    var token = req.param('userResetToken');
    if (req.body != null && req.body.newPassword != null && token != null){
        var chain = userController.getUserForToken(token).then(function(user){
            user.passwordReset = {};
            user.password = req.body.newPassword;
            return user;
        }).then(userController.checkForPassword).then(mongoService.savePromise);

        helper.responseFromPromise(res, chain);
    } else {
        res.jsonp(400, {"error":'required fields are missing'});
    }
};

userController.resetPassword = function(req, res){
    if (req.model != null){
        req.model.passwordReset = {
            tokenCreated: new Date(),
            token: uuid.v4(),
            expirationDate: moment().add(24,'h').toDate()
        };
        var chain = mongoService.savePromise(req.model)
            .then(userController.sendUserPasswordReset);
        helper.responseFromPromise(res, chain);
    } else {
        res.jsonp(400, {"error":'invalid user id'});
    }
};

userController.getUserForToken = function(token){
    var deferred = q.defer();
    User.findOne({"passwordReset.token": token, "passwordReset.expirationDate" : {$gt : new Date()}}, function(err, model) {
        if(err){
            deferred.reject(err);
        } else if(!model){
            deferred.reject({"error": 'Cannot find valid token: ' + token});
        } else {
            deferred.resolve(model);
        }
    });
    return deferred.promise;
};