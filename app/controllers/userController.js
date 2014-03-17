'use strict';

var userController = module.exports = {};

var mongoose = require('mongoose');
var User = mongoose.model('User');
var AllowedUser = mongoose.model('AllowedUser');

userController.create = function(req, res) {
    var user = new User(req.body);
    user.provider = 'local';
    AllowedUser.findOne({"email": user.email}, function(err, result){
        if (err){
            res.send(400, err);
        } else if (result) {
            User.findOne({"email": user.email}, function(err, userResult){
                if (err){
                    res.send(400, err);
                } else if (userResult) {
                    res.send(400, 'user with the email ' + user.email + " already exists");
                } else {
                    user.save(function(err, result){
                        if (err){
                            res.send(400, err.message);
                        } else {
                            res.send(200, result);
                        }
                    });
                }
            });
        } else {
            res.send(400, 'email is not on the allowed white list');
        }
    });
};

userController.me = function(req, res) {
    if (req.user){
        res.jsonp(req.user);
    } else {
        res.send(400, 'no user session found');
    }

};
