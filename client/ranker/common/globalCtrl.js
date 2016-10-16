angular.module('controllers').controller('globalCtrl', ['$scope', 'rankerEventBus',
    function($scope, rankerEventBus) {
        $scope.load = function(){
        };

        $scope.$on(rankerEventBus.EVENTS.USER_LOGIN,function(data) {
            $scope.user = data;
        });

        $scope.$on(rankerEventBus.EVENTS.USER_LOGOUT,function() {
            delete $scope.user;
        });
    }
]);