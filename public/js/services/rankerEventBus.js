angular.module('services').service('rankerEventBus', ['$rootScope', function($rootScope) {
    var eventBus = {};
    eventBus.EVENTS = {
        ON_FOCUS: "ON_FOCUS",
        ON_ERROR: "ON_ERROR"
    };

    eventBus.broadcastEvent = function(event, data) {
        $rootScope.$broadcast(event, data);
    };

    return eventBus;
}]);