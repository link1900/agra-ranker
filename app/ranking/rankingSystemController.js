const rankingSystemController = module.exports = {};

const _ = require('lodash');
const q = require('q');
const RankingSystem = require('./rankingSystem').model;
const helper = require('../helper');
const mongoService = require('../mongoService');
const rankingSystemService = require('./rankingSystemService');

rankingSystemController.setModel = function (req, res, next, id) {
    RankingSystem.findById(id, (err, model) => {
        if (err) return next(err);
        if (!model) return next(new Error(`Failed to load ${id}`));
        req.model = model;
        return next();
    });
};

rankingSystemController.prepareQuery = function (req, res, next) {
    req.searchQuery = {};
    const like = req.param('like');
    const name = req.param('name');
    if (like) {
        req.searchQuery = { name: { $regex: like.toLowerCase() } };
    }
    if (name) {
        req.searchQuery = { name: name.toLowerCase() };
    }
    req.dao = RankingSystem;
    next();
};

rankingSystemController.create = function (req, res) {
    const entityRequest = {};
    entityRequest.rawEntity = req.body;
    const processChain = rankingSystemService.preProcessRaw(entityRequest)
        .then(rankingSystemController.make)
        .then(rankingSystemService.validate)
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);
};

rankingSystemController.update = function (req, res) {
    const entityRequest = {};
    entityRequest.rawEntity = req.body;
    entityRequest.existingEntity = req.model;
    const processChain = rankingSystemService.preProcessRaw(entityRequest)
        .then(helper.mergeEntityRequest)
        .then(rankingSystemService.validate)
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);
};

rankingSystemController.destroy = function (req, res) {
    helper.responseFromPromise(res, mongoService.removePromise(req.model));
};

rankingSystemController.make = function (entityRequest) {
    entityRequest.newEntity = new RankingSystem(entityRequest.newEntity);
    return q(entityRequest);
};

rankingSystemController.getPresetFields = function (req, res) {
    res.jsonp(_.keys(rankingSystemService.presetCriteriaFields).map((key) => {
        return {
            label: rankingSystemService.presetCriteriaFields[key].label,
            value: key
        };
    }));
};
