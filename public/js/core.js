angular.module('core',
        ['ngRoute',
         'ngResource',
         'ui.bootstrap',
         'controllers',
         'services']);

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


