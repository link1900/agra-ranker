var migration = module.exports = {};

var q = require('q');
var mongoose = require('mongoose');
var AllowedUser = mongoose.model('AllowedUser');
var GroupLevel = mongoose.model('GroupLevel');
var helper = require('../helper');

migration.up = function(){
    return helper.saveAll([
        new AllowedUser({"email":"link1900@gmail.com"}),
        new AllowedUser({"email":"nbrown99@bigpond.net.au"}),
        new GroupLevel({"_id" : "531d1f72e407586c21476ef7", "name" : "Group 1"}),
        new GroupLevel({"_id" : "531d1f72e407586c21476f0c", "name" : "Group 2"}),
        new GroupLevel({"_id" : "531d1f72e407586c21476f0d", "name" : "Group 3"})
    ]);
};