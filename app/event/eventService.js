var eventService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var logger = require('winston');
var mongoService = require('../mongoService');
var EventModel = require('./event').model;

eventService.listeners = [];

eventService.logEvent = function(event, requireConfirmation){
    if (requireConfirmation === true){
        var proms = eventService.listeners.map(function(listener){
            if (event.type != null && event.type.match(listener.regexString) && listener.onEvent != null){
                return q(listener.onEvent(event));
            } else {
                return q(true);
            }
        });

        return q.allSettled(proms);
    } else {
        eventService.listeners.forEach(function(listener){
            if (event.type != null && event.type.match(listener.regexString) && listener.onEvent != null){
                listener.onEvent(event);
            }
        });
        return q(true);
    }
};

eventService.logEntity = function(opType, entity){
    if (entity != null && entity.constructor != null){
        eventService.logEvent({type:opType+"_"+entity.constructor.modelName, data: entity._id});
    }
    return q(entity);
};

eventService.logCreateEntity = function(entity){
    return eventService.logEntity("Created", entity);
};

eventService.logUpdateEntity = function(entity){
    return eventService.logEntity("Updated", entity);
};

eventService.logDeleteEntity = function(entity){
    return eventService.logEntity("Deleted", entity);
};

eventService.persistEventListener = function(event){
    return mongoService.savePromise(new EventModel(event));
};

eventService.logEventListener = function(event){
    logger.log('info', event.type);
};

eventService.addListener = function(name, eventNameRegexString, listeningFunction){
    eventService.listeners.push({name: name,regexString:eventNameRegexString, onEvent : listeningFunction});
};

eventService.clearListeners = function(){
    eventService.listeners = [];
};

eventService.removeListenerByName = function(name){
    eventService.listeners = eventService.listeners.filter(function(listener){
        return listener.name != name;
    });
};

eventService.removeListenerByRegex = function(eventNameRegexString){
    eventService.listeners = eventService.listeners.filter(function(listener){
        return listener.regexString != eventNameRegexString;
    });
};

eventService.addListener("persistence listener",".*",eventService.persistEventListener);
eventService.addListener("log listener",".*",eventService.logEventListener);