angular.module('core').config(function($routeProvider) {
    $routeProvider
        .when('/invite/create', {
            templateUrl : '/ranker/invite/inviteCreate.html'
        })
        .when('/invite', {
            templateUrl : '/ranker/invite/invite.html'
        })
        .when('/invite/view/:id', {
            templateUrl : '/ranker/invite/inviteView.html'
        })
});