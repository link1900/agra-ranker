angular.module('controllers').controller('menuCtrl', ['$scope', 'securityService','$location', 'authService',
    function($scope, securityService, $location, authService) {
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