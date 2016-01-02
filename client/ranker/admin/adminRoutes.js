angular.module('core').config(function($routeProvider) {
    $routeProvider
        .when('/admin', {
            templateUrl : '/ranker/admin/admin.html'
        });
});