angular.module('core').config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl : 'rankings.html'
        })
        .when('/greyhound/edit/:id', {
            templateUrl : '/views/greyhoundEditForm.html'
        })
        .when('/greyhound/view/:id', {
            templateUrl : '/views/greyhoundDetail.html'
        })
        .when('/greyhound/create', {
            templateUrl : '/views/greyhoundCreateForm.html'
        })
        .when('/greyhound', {
            templateUrl : 'greyhound.html'
        })
        .when('/greyhound/import', {
            templateUrl : '/views/greyhoundUpload.html'
        })
        .when('/batch', {
            templateUrl : '/views/batchList.html'
        })
        .when('/batch/view/:id', {
            templateUrl : '/views/batchView.html'
        })
        .when('/login', {
            templateUrl : '/views/login.html'
        })
        .when('/signup', {
            templateUrl : '/views/signup.html'
        })
        .when('/race', {
            templateUrl : 'race.html'
        })
        .when('/rule', {
            templateUrl : 'rule.html'
        })
        .when('/import', {
            templateUrl : 'import.html'
        })
        .otherwise({
            redirectTo : '/'
        });
});