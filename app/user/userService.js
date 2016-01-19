var userService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var uuid = require('node-uuid');
var moment = require('moment');
var User = require('./user').model;
var Invite = require('../invite/invite').model;
var userStates = require('./user').states;
var notificationService = require('../notification/notificationService');
var mongoService = require('../mongoService');
var validator = require('validator');
var cleaner = require('validator');


userService.resetPassword = function(user){
    user.passwordReset = {
        tokenCreated: new Date(),
        token: uuid.v4(),
        expirationDate: moment().add(24,'h').toDate()
    };

    return mongoService.savePromise(user).then(userService.sendUserPasswordReset);
};

userService.sendUserPasswordReset = function(user){
    var email = {subs:{}};

    email.to = user.email;
    email.subject = "Password change request";
    email.subs.passwordLink = notificationService.siteUrl + "/#/user/passwordReset/" + user.passwordReset.token;
    email.template = "passwordReset";
    return notificationService.sendEmail(email).then(function(){
        return user;
    });
};

userService.sendNewUserRequestReceivedEmail = function(user){
    var email = {subs:{}};

    return mongoService.find(User, {'settings.notifications.newUserRequest' : true}).then(function(users){
        if (users.length > 0){
            email.to = users.map(function(i){return i.email;});
            email.subject = "New user request received";
            email.subs.viewUserLink = notificationService.siteUrl + "/#/user/view/" + user._id;
            email.template = "newUserRequest";
            return notificationService.sendEmail(email).then(function(){
                return user;
            });
        } else {
            return q(user);
        }
    });
};

userService.sendUserAcceptedEmail = function(user){
    var email = {subs:{}};
    email.to = user.email;
    email.subject = "Welcome to the {{siteName}}";
    email.template = "registrationAccepted";
    return notificationService.sendEmail(email).then(function(){
        return user;
    });
};

userService.setUserActive = function(user){
    user.state = 'Active';
    return q(user);
};

userService.checkForPassword = function(user){
    if (validator.isNull(user.password) || !validator.isLength(user.password, 6, 150)){
        return q.reject("must provide a valid password field");
    }

    return q(user);
};

userService.cleanUser = function(user){
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

userService.checkForPasscode = function(user, bootstrap){
    if (bootstrap != null){
        if (bootstrap == process.env.FIRST_USER_PASSCODE){
            return userService.systemRequiresUsers().then(function(requiresUsers){
                if (requiresUsers != null && requiresUsers.result != null && requiresUsers.result){
                    user.state = userStates.active;
                    user.settings.notifications.newUserRequest = true;
                    return q(user);
                } else {
                    return q.reject('can only user passcode when the system has no users');
                }
            });
        } else {
            return q.reject('passcode incorrect');
        }
    } else {
        return q(user);
    }
};

userService.sendNewUserEmail = function(user){

    return q(user);
};

userService.checkForInvite = function(user, inviteToken){
    if (inviteToken){
        return mongoService.findOne(Invite, {token: inviteToken, "expiry" : {$gt : new Date()}}).then(function(foundInvite){
            if (foundInvite){
                user.email = foundInvite.email;
                user.state = userStates.active;
                mongoService.removePromise(foundInvite);
                return q(user);
            } else {
                return q.reject('invite token is invalid');
            }
        });
    } else {
        return q(user);
    }
};

userService.clearAllInvites = function(user){
    return mongoService.removeAll(Invite, {email: user.email}).then(function(){
        return q(user);
    });
};

userService.validateUserIsEditable = function(user){
    if (!_.contains(['Active','Inactive'], user.state)){
        return q.reject("can only edit a user that is active or inactive");
    }

    return q(user);
};

userService.getUserForToken = function(token){
    var deferred = q.defer();
    User.findOne({"passwordReset.token": token, "passwordReset.expirationDate" : {$gt : new Date()}}, function(err, model) {
        if(err){
            deferred.reject(err);
        } else if(!model){
            deferred.reject('Invalid token');
        } else {
            deferred.resolve(model);
        }
    });
    return deferred.promise;
};

userService.cleanEmail = function(email){
    if (email){
        return q(cleaner.normalizeEmail(email));
    } else {
        return q(email);
    }
};

userService.findUserByEmail = function(email){
    return mongoService.findOne(User, {email: email});
};

userService.validateEmail = function(email){
    if (validator.isNull(email) || !validator.isEmail(email)){
        return q.reject("must provide a valid email");
    } else {
        return q(email);
    }
};

userService.validateUser = function(user){
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

userService.newUser = function(userRequest, startingState){
    var user = userRequest;
    if (startingState != null){
        user.state = startingState;
    }
    return q(new User(user));
};

userService.checkIfAccessCanBeGranted = function(user){
    if (user.state == "Requested Access"){
        return q(user);
    } else {
        return q.reject("Can only grant access to new users that have requested it");
    }
};

userService.checkIfUserExists = function(user){
    return mongoService.oneExists(User, {_id: {$ne: user._id}, email: user.email}).then(function(exists){
        if (exists){
            return q.reject('email ' + user.email + " is already used");
        } else {
            return q(user);
        }
    })
};

userService.mergeUpdateRequest = function(updateRequest, existingEntity){
    delete updateRequest.password;
    return q(_.extend(existingEntity, updateRequest));
};

userService.systemRequiresUsers = function(){
    return mongoService.getCollectionCount(User).then(function(count){
        return {"result": count == 0};
    });
};
