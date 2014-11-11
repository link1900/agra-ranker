var adminController = module.exports = {};

var q = require('q');
var adminService = require('./adminService');
var helper = require('../helper');

adminController.removeAllGreyhounds = function(req, res){
    helper.responseFromPromise(res, adminService.removeAllGreyhounds());
};

adminController.removeAllBatchJobs = function(req, res){
    helper.responseFromPromise(res, adminService.removeAllBatchJobs());
};

adminController.getCounts = function(req, res){
    helper.responseFromPromise(res, adminService.getAllCounts());
};