var settingService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var moment = require('moment');
var logger = require('winston');
var validator = require('validator');
var Setting = require('./setting').model;
var mongoService = require('../mongoService');
var baseService = require('../baseService');

baseService.addStandardServiceMethods(settingService, Setting);