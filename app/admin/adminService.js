var adminService = module.exports = {};

var mongoose = require('mongoose');
var PointAllotment = mongoose.model('PointAllotment');
var Placing = mongoose.model('Placing');
var Ranking = mongoose.model('Ranking');
var Race = mongoose.model('Race');
var Greyhound = mongoose.model('Greyhound');
var _ = require('lodash');
var helper = require('../helper');
var mongoHelper = require('../mongoHelper');
var Schema = mongoose.Schema;
var q = require('q');

adminService.removeAllGreyhounds = function(){
    return mongoHelper.dropCollection(Placing).then(function(){
        return mongoHelper.dropCollection(Greyhound);
    });
};