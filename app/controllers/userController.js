'use strict';

var userController = module.exports = {};

var mongoose = require('mongoose');
var User = mongoose.model('User');

userController.create = function(req, res) {
    var user = new User(req.body);
    user.provider = 'local';
    user.save(function(err, result){
        if (err){
            res.send(400, err);
        } else {
            res.send(200, result);
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
