angular.module('core').config(function declareRoutes($routeProvider) {
    $routeProvider.when('/', {
            templateUrl: '/views/rankings.html'
        })
        .when('/greyhound/edit/:id', {
            templateUrl: '/ranker/greyhound/greyhoundForm.html'
        })
        .when('/greyhound/view/:id', {
            templateUrl: '/ranker/greyhound/greyhoundView.html'
        })
        .when('/greyhound/create', {
            templateUrl: '/ranker/greyhound/greyhoundForm.html'
        })
        .when('/greyhound', {
            templateUrl: '/ranker/greyhound/greyhound.html'
        })
        .when('/greyhound/import', {
            templateUrl: '/ranker/greyhound/greyhoundUpload.html'
        })
        .when('/race/create', {
            templateUrl: '/ranker/race/raceForm.html'
        })
        .when('/race/edit/:id', {
            templateUrl: '/ranker/race/raceForm.html'
        })
        .when('/race/view/:id', {
            templateUrl: '/ranker/race/raceView.html'
        })
        .when('/race', {
            templateUrl: '/ranker/race/race.html'
        })
        .when('/rankingSystem/create', {
            templateUrl: '/ranker/rankingSystem/rankingSystemCreate.html'
        })
        .when('/rankingSystem/edit/:id', {
            templateUrl: '/ranker/rankingSystem/rankingSystemEdit.html'
        })
        .when('/rankingSystem/view/:id', {
            templateUrl: '/ranker/rankingSystem/rankingSystemView.html'
        })
        .when('/rankingSystem', {
            templateUrl: '/ranker/rankingSystem/rankingSystem.html'
        })
        .otherwise({
            redirectTo: '/'
        });
});
