var app = angular.module('core',
        ['ngRoute',
         'ui.bootstrap',
         'controllers',
         'services'])
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

angular.module('controllers', []);
angular.module('services', []);



function MenuCtrl($scope, $location){
	$scope.activePath = '/';
	$scope.$on('$routeChangeSuccess', function(){
		$scope.activePath = $location.path();
	});
}

function RankingsCtrl($scope){
	$scope.rankings = [];
}

function RaceCtrl($scope) {
	$scope.races = [];
}

function RuleCtrl($scope) {
}

function AdminCtrl($scope){
	
}


