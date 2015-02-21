var groupLevelController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');

var GroupLevel = require('./groupLevel').model;
var Race = mongoose.model('Race');
var helper = require('../helper');
var mongoService = require('../mongoService');

var eventService = require('../event/eventService');
var groupLevelService = require('../groupLevel/groupLevelService');
var expressService = require('../expressService');

groupLevelController.setModel = function(req, res, next, id) {
    GroupLevel.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load ' + id));
        req.model = model;
        return next();
    });
};

groupLevelController.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var like = req.param('like');
    var name = req.param('name');
    if (like){
        req.searchQuery = {'name': {'$regex': like, '$options' : 'i'}};
    }
    if (name){
        req.searchQuery = {'name': name};
    }
    req.dao = GroupLevel;
    next();
};

groupLevelController.create = function(req, res) {
    expressService.promToRes(groupLevelService.createGroupLevelFromJson(req.body), res);
};

groupLevelController.update = function(req, res) {
    expressService.promToRes(groupLevelService.updateGroupLevelFromJson(req.model, req.body), res);
};

groupLevelController.destroy = function(req, res) {
    helper.responseFromPromise(res,
        mongoService.cleanFk(Race, 'groupLevelRef', req.model)
        .then(mongoService.removePromise)
    );
};
