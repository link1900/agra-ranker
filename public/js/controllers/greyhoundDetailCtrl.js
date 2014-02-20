angular.module('controllers').controller('GreyhoundDetailCtrl', ['$scope', 'rankerEventBus', function($scope, rankerEventBus) {
    $scope.greyhound = null;

    $scope.$on(rankerEventBus.EVENTS.FOCUS_EVENT, function(event, eventData) {
        $scope.greyhound = eventData;
    });

    $scope.closeDetails = function(){
        delete $scope.greyhound;
    }
}]);