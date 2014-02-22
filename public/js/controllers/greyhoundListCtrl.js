angular.module('controllers').controller('GreyhoundListCtrl', ['$scope', 'greyhoundService', function($scope, greyhoundService) {
    $scope.find = function() {
        greyhoundService.query(function(greyhounds) {
            $scope.greyhounds = greyhounds;
        });
    };
}]);