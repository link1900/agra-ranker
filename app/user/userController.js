'use strict';

var userController = module.exports = {};

var mongoose = require('mongoose');
var User = require('./user').model;
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

userController.create = function(req, res) {
    var user = new User(req.body);
    user.provider = 'local';
    AllowedUser.findOne({"email": user.email}, function(err, result){
        if (err){
            res.jsonp(400, {error:err});
        } else if (result) {
            User.findOne({"email": user.email}, function(err, userResult){
                if (err){
                    res.jsonp(400, {error:err});
                } else if (userResult) {
                    res.jsonp(400, {error:'user with the email ' + user.email + " already exists"});
                } else {
                    user.save(function(err, result){
                        if (err){
                            res.jsonp(400, {error:err});
                        } else {
                            res.jsonp(200, result);
                        }
                    });
                }
            });
        } else {
            res.jsonp(400, {error:'email is not on the allowed white list'});
        }
    });
};

userController.me = function(req, res) {
    if (req.user){
        res.jsonp(req.user);
    } else {
        res.jsonp(400, {"error":'no user session found'});
    }

};
