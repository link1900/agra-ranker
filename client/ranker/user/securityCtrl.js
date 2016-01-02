angular.module('controllers').controller('securityCtrl', ['$scope', '$routeParams', 'securityService', 'rankerEventBus', '$location', '$window',
    function($scope, $routeParams, securityService, rankerEventBus, $location, $window) {

        $scope.signIn = function(){
            securityService.signIn($scope.login).then(function(result){
                rankerEventBus.broadcastEvent(rankerEventBus.EVENTS.USER_LOGIN, result.data);
                $scope.alerts = [
                    { type: 'success', msg: "Login successful" }
                ];
                $window.location.href = '/';
            }, function(error){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed to login: " + error.data.error }
                ];
            });
        };
    }
]);