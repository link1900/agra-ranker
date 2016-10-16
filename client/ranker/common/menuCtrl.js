angular.module('controllers').controller('menuCtrl', ['$scope','$location', 'authService',
    function($scope, $location, authService) {
        $scope.isCollapsed = true;
        $scope.logout = function(){
            if($scope.user){
                authService.logout();
                $scope.user = null;
            }
        };

        $scope.login = function(){
            authService.login();
        };

        $scope.signUp = function(){
            $location.path('/signup');
        };
    }
]);