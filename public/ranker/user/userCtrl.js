angular.module('controllers').controller('userCtrl', function($scope, $routeParams, userService, $location) {

        $scope.findOne = function() {
            userService.get({
                userId: $routeParams.id
            }, function(foundUser) {
                $scope.selectedUser = foundUser;
            }, function(){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
                ];
            });
        };

        $scope.createUser = function(){
            userService.save({}, $scope.selectedUser, function(response){
                    $location.path('user/view/'+ response._id);
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "create failed - " + error.data.error }
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
);