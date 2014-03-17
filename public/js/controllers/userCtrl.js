angular.module('controllers').controller('userCtrl', ['$scope', '$routeParams', 'userService',
    function($scope, $routeParams, userService) {

        $scope.signUp = function(){
            userService.signUp($scope.user).then(function(){
                $scope.userCreated = true;
                $scope.alerts = [
                    { type: 'success', msg: "User created successfully" }
                ];
            }, function(error){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed to create user: " + error.data }
                ];
            });
        };
    }
]);