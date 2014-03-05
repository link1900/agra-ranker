angular.module('services').factory('rankerEventBus', ['$rootScope', function($rootScope) {
    var eventBus = {};
    eventBus.EVENTS = {
        ON_FOCUS: "ON_FOCUS",
        ON_ERROR: "ON_ERROR",
        ON_CHANGE: "ON_CHANGE",
        DO_RELOAD: "DO_RELOAD",
        ENTITY_BATCH_CREATED: "ENTITY_BATCH_CREATED",
        ENTITY_BATCH_UPDATED: "ENTITY_BATCH_UPDATED"
    };

    eventBus.broadcastEvent = function(event, data) {
        $rootScope.$broadcast(event, data);
    };

    return eventBus;
}]);