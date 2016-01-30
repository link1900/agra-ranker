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
        .when('/batch', {
            templateUrl: '/ranker/batch/batch.html'
        })
        .when('/batch/view/:id', {
            templateUrl: '/ranker/batch/batchView.html'
        })
        .when('/batchResult/view/:id', {
            templateUrl: '/ranker/batch/batchResultView.html'
        })
        .when('/file', {
            templateUrl: '/ranker/file/file.html'
        })
        .when('/file/view/:id', {
            templateUrl: '/ranker/file/fileView.html'
        })
        .otherwise({
            redirectTo: '/'
        });
});