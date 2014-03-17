angular.module('controllers').controller('globalCtrl', ['$scope', 'rankerEventBus', 'securityService',
    function($scope, rankerEventBus, securityService) {
        $scope.load = function(){
            securityService.getCurrentUser().then(function(user){
                $scope.user = user;
            })
        };

        $scope.$on(rankerEventBus.EVENTS.USER_LOGIN,function(data) {
            $scope.user = data;
        });

        $scope.$on(rankerEventBus.EVENTS.USER_LOGOUT,function() {
            delete $scope.user;
        });

        $scope.load();
    }
]);