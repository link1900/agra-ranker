var groupLevelController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');

var groupLevelService = require('../groupLevel/groupLevelService');
var expressService = require('../expressService');

expressService.addStandardMethods(groupLevelController, groupLevelService);

groupLevelController.find = function(req, res){
    expressService.standardSearch(req, res, groupLevelService, ['name=name','name~like']);
};

groupLevelController.create = function(req, res) {
    expressService.promToRes(groupLevelService.createGroupLevelFromJson(req.body), res);
};

groupLevelController.update = function(req, res) {
    expressService.promToRes(groupLevelService.updateGroupLevelFromJson(req.model, req.body), res);
};

groupLevelController.destroy = function(req, res) {
    expressService.promToRes(groupLevelService.remove(req.model), res);
};
