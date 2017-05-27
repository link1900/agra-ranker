const eventService = module.exports = {};

const q = require('q');
const logger = require('winston');
const mongoService = require('../mongoService');
const EventModel = require('./event').model;

eventService.listeners = [];

eventService.count = function () {
    return mongoService.getCollectionCount(EventModel);
};

eventService.find = function (query, limit, offset, sort) {
    return mongoService.find(EventModel, query, limit, offset, sort);
};

eventService.logEvent = function (event, requireConfirmation) {
    if (requireConfirmation === true) {
        const proms = eventService.listeners.map((listener) => {
            if (event.type && event.type.match(listener.regexString) && listener.onEvent) {
                return q(listener.onEvent(event));
            } else {
                return q(true);
            }
        });

        return q.allSettled(proms);
    } else {
        eventService.listeners.forEach((listener) => {
            if (event.type && event.type.match(listener.regexString) && listener.onEvent) {
                listener.onEvent(event);
            }
        });
        return q(true);
    }
};

eventService.logEntity = function (opType, entity) {
    if (entity && entity.constructor) {
        eventService.logEvent({ type: `${opType} ${entity.constructor.modelName}`, data: { entity } });
    }
    return q(entity);
};

eventService.logCreateEntity = function (entity) {
    return eventService.logEntity('Created', entity);
};

eventService.logUpdateEntity = function (entity) {
    return eventService.logEntity('Updated', entity);
};

eventService.logDeleteEntity = function (entity) {
    return eventService.logEntity('Deleted', entity);
};

eventService.persistEventListener = function (event) {
    return mongoService.savePromise(new EventModel(event));
};

eventService.logEventListener = function (event) {
    logger.log('info', event.type);
};

eventService.addListener = function (name, eventNameRegexString, listeningFunction) {
    eventService.listeners.push({ name, regexString: eventNameRegexString, onEvent: listeningFunction });
};

eventService.clearListeners = function () {
    eventService.listeners = [];
};

eventService.removeListenerByName = function (name) {
    eventService.listeners = eventService.listeners.filter((listener) => {
        return listener.name !== name;
    });
};

eventService.removeListenerByRegex = function (eventNameRegexString) {
    eventService.listeners = eventService.listeners.filter((listener) => {
        return listener.regexString !== eventNameRegexString;
    });
};

eventService.addListener('persistence listener', '.*', eventService.persistEventListener);
eventService.addListener('log listener', '.*', eventService.logEventListener);
