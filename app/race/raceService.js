var raceService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var Race = require('./race').model;
var Placing = mongoose.model('Placing');
var helper = require('../helper');
var mongoHelper = require('../mongoHelper');
var BatchJob = require('../batch/batchJob').model;
var BatchResult = require('../batch/batchResult').model;
var batchService = require('../batch/batchService');
var csv = require('csv');
var grid = require('gridfs-stream');
var gfs = grid(mongoose.connection.db);

raceService.raceBatchTypes = {
    importRaceCSV : "Import race csv"
};