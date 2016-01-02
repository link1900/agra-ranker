angular.module('core').config(function($routeProvider) {
    $routeProvider
        .when('/user', {
            templateUrl : '/ranker/user/user.html'
        })
        .when('/user/view/:id', {
            templateUrl : '/ranker/user/userView.html'
        })
        .when('/user/create', {
            templateUrl : '/ranker/user/userCreate.html'
        })
        .when('/user/edit/:id', {
            templateUrl : '/ranker/user/userEdit.html'
        })
        .when('/login', {
            templateUrl : '/ranker/user/login.html'
        })
        .when('/user/passwordEdit', {
            templateUrl : '/ranker/user/passwordEdit.html'
        })
        .when('/user/passwordReset/:token', {
            templateUrl : '/ranker/user/passwordEditToken.html'
        })
        .when('/user/forgotPassword', {
            templateUrl : '/ranker/user/forgotPassword.html'
        })
        .when('/signup', {
            templateUrl : '/ranker/user/signup.html'
        })
        .when('/signup/:token', {
            templateUrl : '/ranker/user/signup.html'
        })
});