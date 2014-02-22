angular.module('controllers').controller('GreyhoundDetailCtrl', ['$scope', '$routeParams', 'greyhoundService',
function($scope, $routeParams, greyhoundService) {

    $scope.findOne = function() {
        greyhoundService.get({
            greyhoundId: $routeParams.id
        }, function(greyhound) {
            $scope.greyhound = greyhound;
        }, function(){
            $scope.alerts = [
                { type: 'danger', msg: "Failed to greyhound with id " + $routeParams.id }
            ];
        });
    };

}]);