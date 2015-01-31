var eventService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var logger = require('winston');
var mongoService = require('../mongoService');
var EventModel = require('./event').model;

eventService.listeners = [];

eventService.logEvent = function(event){
    eventService.listeners.forEach(function(listener){
        if (event.type != null && event.type.match(listener.regexString) && listener.onEvent != null){
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

eventService.persistEventListener = function(event){
    return mongoService.savePromise(new EventModel(event));
};

eventService.logEventListener = function(event){
    logger.log('info', event.type);
};

eventService.addListener = function(eventNameRegexString, listeningFunction){
    eventService.listeners.push({regexString:eventNameRegexString, onEvent : listeningFunction});
};

eventService.clearListeners = function(){
    eventService.listeners = [];
};

eventService.addListener(".*",eventService.persistEventListener);
eventService.addListener(".*",eventService.logEventListener);