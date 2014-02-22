angular.module('core',
        ['ngRoute',
         'ngResource',
         'ui.bootstrap',
         'ui.select2',
         'controllers',
         'services',
         'directives']);


angular.module('controllers', []);
angular.module('services', []);
angular.module('directives', []);



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


