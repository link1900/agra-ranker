angular.module('controllers').controller('menuCtrl', ['$scope', 'securityService','$location',
    function($scope, securityService, $location) {
        $scope.isCollapsed = true;

        $scope.logout = function(){
            if($scope.user){
                securityService.signOut().then(function(){
                    $location.path('/');
                    window.location.reload(true);
                });
            }
        };

        $scope.login = function(){
            $location.path('/login');
        };

        $scope.signUp = function(){
            $location.path('/signup');
        };
    }
]);