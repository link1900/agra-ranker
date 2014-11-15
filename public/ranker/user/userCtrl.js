angular.module('controllers').controller('userCtrl', ['$scope', '$routeParams', 'userService',
    function($scope, $routeParams, userService) {

        $scope.signUp = function(){
            userService.signUp($scope.user).then(function(){
                $scope.registeredSuccess = true;
            }, function(failedResponse){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed to register user: " + failedResponse.data.error }
                ];
            });
        };
    }
]);