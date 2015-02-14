angular.module('core').config(function($routeProvider) {
    $routeProvider
        .when('/event', {
            templateUrl : '/ranker/event/event.html'
        });
});