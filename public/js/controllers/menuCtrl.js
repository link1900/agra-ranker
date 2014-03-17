angular.module('controllers').controller('menuCtrl', ['$scope', 'securityService','$location',
    function($scope, securityService, $location) {
        $scope.logout = function(){
            if($scope.user){
                securityService.signOut().then(function(){
                    $location.path('/');
                    window.location.reload(true);
                });
            }
        };

        $scope.activePath = '/';
        $scope.$on('$routeChangeSuccess', function(){
            $scope.activePath = $location.path();
        });
    }
]);