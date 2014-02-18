var app = angular.module('core',['ngRoute','ui.bootstrap'])
    .config(function($routeProvider) {
	$routeProvider.when('/', {
		controller : RankingsCtrl,
		templateUrl : 'rankings.html'
	}).when('/greyhound', {
		templateUrl : 'greyhound.html'
	}).when('/race', {
		controller : RaceCtrl,
		templateUrl : 'race.html'
	}).when('/rule', {
		controller : RuleCtrl,
		templateUrl : 'rule.html'
	}).when('/todo', {
		controller : AdminCtrl,
		templateUrl : 'todo.html'
	}).when('/admin', {
		controller : AdminCtrl,
		templateUrl : 'admin.html'
	}).otherwise({
		redirectTo : '/'
	});
});

function MenuCtrl($scope, $location){
	$scope.activePath = '/';
	$scope.$on('$routeChangeSuccess', function(){
		$scope.activePath = $location.path();
	});
}

function RankingsCtrl($scope){
	$scope.rankings = [];
}

function GreyhoundListCtrl($scope, $http) {
    $http.get('/greyhound').success(function(data) {
        $scope.greyhounds = data;
    });
}

function GreyhoundFormCtrl($scope, $http) {

    $scope.createFormOpen = false;
    $scope.toggleCreateForm = function Open(){
        $scope.createFormOpen = !$scope.createFormOpen;
    };

    $scope.clearForm = function(){
        $scope.toggleCreateForm();
        $scope.greyhound = null;
        $scope.resultMessage = null;
        $scope.alerts = null;
    };

    $scope.save = function(){
        $http.post('/greyhound', $scope.greyhound)
            .success(function(data, status, headers, config) {
                $scope.alerts = [
                    { type: 'success', msg: "Created new greyhound " + data.name }
                ];
            })
            .error(function(data, status, headers, config) {
                $scope.alerts = [
                    { type: 'danger', msg: data }
                ];
            });
    };

    $scope.searchGreyhound = function(val) {
        return $http.get('/greyhound', {
            params: {
                like: val
            }
        }).then(function(res){
                return _.chain(res.data)
                    .pluck('name')
                    .map(function(v){return v.toUpperCase()})
                    .value();
            });
    };

    $scope.delete = function(){
        $scope.toggleCreateForm();
        $scope.greyhound = null;
    };

}

function RaceCtrl($scope) {
	$scope.races = [];
}

function RuleCtrl($scope) {
}

function AdminCtrl($scope){
	
}


