angular.module('controllers').controller('userCtrl', ['$scope', '$routeParams', 'userService',
    function($scope, $routeParams, userService) {

        $scope.findOne = function() {
            userService.get({
                userId: $routeParams.id
            }, function(file) {
                $scope.user = user;
            }, function(){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
                ];
            });
        };

        $scope.signUp = function(){
            userService.signUp($scope.user).then(function(){
                $scope.registeredSuccess = true;
            }, function(failedResponse){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed to register user: " + failedResponse.data.error }
                ];
            });
        };

        $scope.deleteUser = function(){

        };

        $scope.userService  = userService;

        $scope.columnInfo = [
            {title: "Email", field:"email", baseLink:"#/user/view/", linkField: "_id", link:true},
            {title: "Status", field:"state"},
            {title: "Created Date", field:"createdAt", filter: "date", filterFormat: 'medium'}
        ];
    }
]);