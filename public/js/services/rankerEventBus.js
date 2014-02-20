angular.module('services').service('rankerEventBus', ['$rootScope', function($rootScope) {
    var eventBus = {};
    eventBus.EVENTS = {
        FOCUS_EVENT: "focusEvent"
    };

    eventBus.broadcastEvent = function(event, data) {
        $rootScope.$broadcast(event, data);
    };

    return eventBus;
}]);