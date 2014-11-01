var adminController = module.exports = {};

var q = require('q');
var adminService = require('./adminService');
var helper = require('../helper');

adminController.removeAllGreyhounds = function(req, res){
    helper.responseFromPromise(res, adminService.removeAllGreyhounds());
};