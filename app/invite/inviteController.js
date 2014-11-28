var inviteController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var Invite = require('./invite').model;
var mongoService = require('../mongoService');
var helper = require('../helper');
var userService = require('./../user/userService');
var validator = require('validator');
var cleaner = require('validator');
var notificationService = require('../notification/notificationService');
var uuid = require('node-uuid');
var moment = require('moment');

inviteController.createInvite = function(req, res){
    var invite = new Invite(req.body);
    invite.token =  uuid.v4();
    invite.expiry = moment().add(1,'months').toDate();
    var result = inviteController.clean(invite)
        .then(inviteController.validate)
        .then(inviteController.checkIsNotUser)
        .then(mongoService.savePromise)
        .then(inviteController.sendInviteEmail);

    helper.responseFromPromise(res, result);
};

inviteController.clean = function(invite){
    if (invite.email){
        invite.email = cleaner.normalizeEmail(invite.email);
    }
    return q(invite);
};

inviteController.validate = function(invite){
    if (validator.isNull(invite.email) || !validator.isEmail(invite.email)){
        return q.reject("must provide a valid email");
    }
    return q(invite);
};

inviteController.checkIsNotUser = function(invite){
    return userService.findUserByEmail(invite.email).then(function(foundUser){
        if (foundUser != null){
            return q.reject("email is already used");
        } else {
            return q(invite);
        }
    });
};

inviteController.sendInviteEmail = function(invite){
    var email = notificationService.createNewEmail();
    email.setSubject("Invitation to join -siteName-");
    email.addSubstitution('-email-', invite.email);
    email.addSubstitution('-inviteLink-', notificationService.siteUrl + "/#/signup/" + invite.token);
    email.setText("Hi -email-,\nYou have been invited to join the -siteName- website. You can create your new account by following the link below and completing your user details.\n-inviteLink-");
    return q(invite);
    //return notificationService.sendEmail(invite.email, email).then(function(){
    //    return invite;
    //});
};