angular.module('core').config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl : 'rankings.html'
        }).when('/greyhound/edit/:id', {
            templateUrl : '/views/greyhoundEditForm.html'
        }).when('/greyhound/view/:id', {
            templateUrl : '/views/greyhoundDetail.html'
        }).when('/greyhound', {
            templateUrl : 'greyhound.html'
        }).when('/race', {
            templateUrl : 'race.html'
        }).when('/rule', {
            templateUrl : 'rule.html'
        }).when('/todo', {
            templateUrl : 'todo.html'
        }).when('/admin', {
            templateUrl : 'admin.html'
        }).otherwise({
            redirectTo : '/'
        });
});