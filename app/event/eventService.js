var eventService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var mongoService = require('../mongoService');
var EventModel = require('./event').model;

eventService.listeners = [];

eventService.logEvent = function(event){
    eventService.listeners.forEach(function(listener){
        if (event.type != null && event.type.match(listener.typeRegex) && listener.onEvent != null){
            listener.onEvent(event);
        }
    });
};

eventService.logEntity = function(opType, entity){
    if (entity != null && entity.constructor != null){
        eventService.logEvent({type:opType+"_"+entity.constructor.modelName, data: entity._id});
    }
    return q(entity);
};

eventService.logCreateEntity = function(entity){
    return eventService.logEntity("Create", entity);
};

eventService.logUpdateEntity = function(entity){
    return eventService.logEntity("Update", entity);
};

eventService.logDeleteEntity = function(entity){
    return eventService.logEntity("Delete", entity);
};

eventService.persistEvent = function(event){
    return mongoService.savePromise(new EventModel(event));
};

eventService.addListener = function(eventTypeRegex, listeningFunction){
    eventService.listeners.push({typeRegex:eventTypeRegex, onEvent : listeningFunction});
};

eventService.addListener(/.*/,eventService.persistEvent);