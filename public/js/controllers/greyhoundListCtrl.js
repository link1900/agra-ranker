angular.module('controllers').controller('GreyhoundListCtrl', ['$scope', '$http', 'rankerEventBus', function($scope, $http, rankerEventBus) {

    $http.get('/greyhound').success(function(data) {
        $scope.greyhounds = data;
    });

    $scope.selectGreyhound = function(greyhound){
        rankerEventBus.broadcastEvent(rankerEventBus.EVENTS.FOCUS_EVENT, greyhound);
    };
}]);