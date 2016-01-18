var groupLevelService = module.exports = {};

var q = require('q');

var mongoService = require('../mongoService');
var baseService = require('../baseService');
var GroupLevel = require('./groupLevel').model;

baseService.addStandardServiceMethods(groupLevelService, GroupLevel);

groupLevelService.createGroupLevelFromJson = function(groupLevelJson){
    return groupLevelService.jsonToModel(groupLevelJson)
        .then(groupLevelService.validate)
        .then(groupLevelService.validateNameDoesNotExists)
        .then(groupLevelService.create);
};

groupLevelService.updateGroupLevelFromJson = function(existingEntity, groupLevelJson){
    return groupLevelService.mergeWithExisting(existingEntity, groupLevelJson)
        .then(groupLevelService.validate)
        .then(groupLevelService.validateNameDoesNotExists)
        .then(groupLevelService.update);
};

groupLevelService.validate = function(groupLevel){
    if (!groupLevel.name){
        return q.reject("name field is required");
    }

    if (groupLevel.name.length == 0){
        return q.reject("name cannot be blank");
    }

    return q(groupLevel);
};

groupLevelService.validateNameDoesNotExists = function(groupLevel){
    return mongoService.findOne(GroupLevel, {name: groupLevel.name}).then(function(result){
        if (result != null){
            if (result._id.toString() == groupLevel._id.toString()){
                return q(groupLevel);
            } else {
                return q.reject("group level name is already used");
            }

        } else {
            return q(groupLevel);
        }
    });
};