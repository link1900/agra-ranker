angular.module('core').config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl : '/views/rankings.html'
        })
        .when('/greyhound/edit/:id', {
            templateUrl : '/views/greyhound/greyhoundEditForm.html'
        })
        .when('/greyhound/view/:id', {
            templateUrl : '/views/greyhound/greyhoundView.html'
        })
        .when('/greyhound/create', {
            templateUrl : '/views/greyhound/greyhoundCreateForm.html'
        })
        .when('/greyhound', {
            templateUrl : '/views/greyhound/greyhound.html'
        })
        .when('/greyhound/import', {
            templateUrl : '/views/greyhound/greyhoundUpload.html'
        })
        .when('/batch', {
            templateUrl : '/views/batch/batchList.html'
        })
        .when('/batch/view/:id', {
            templateUrl : '/views/batch/batchView.html'
        })
        .when('/signup', {
            templateUrl : '/views/signup.html'
        })
        .when('/race/create', {
            templateUrl : '/views/race/raceCreate.html'
        })
        .when('/race/edit/:id', {
            templateUrl : '/views/race/raceEdit.html'
        })
        .when('/race/view/:id', {
            templateUrl : '/views/race/raceView.html'
        })
        .when('/race', {
            templateUrl : '/views/race/race.html'
        })
        .when('/rankingSystem/create', {
            templateUrl : '/views/rankingSystem/rankingSystemCreate.html'
        })
        .when('/rankingSystem/edit/:id', {
            templateUrl : '/views/rankingSystem/rankingSystemEdit.html'
        })
        .when('/rankingSystem/view/:id', {
            templateUrl : '/views/rankingSystem/rankingSystemView.html'
        })
        .when('/rankingSystem', {
            templateUrl : '/views/rankingSystem/rankingSystem.html'
        })
        .when('/groupLevel/create', {
            templateUrl : '/views/groupLevel/groupLevelCreate.html'
        })
        .when('/groupLevel/edit/:id', {
            templateUrl : '/views/groupLevel/groupLevelEdit.html'
        })
        .when('/groupLevel/view/:id', {
            templateUrl : '/views/groupLevel/groupLevelView.html'
        })
        .when('/groupLevel', {
            templateUrl : '/views/groupLevel/groupLevel.html'
        })
        .when('/import', {
            templateUrl : '/views/batch/batch.html'
        })
        .otherwise({
            redirectTo : '/'
        });
});