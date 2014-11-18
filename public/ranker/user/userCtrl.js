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

        $scope.save = function(){
            $scope.selectedUser.$update(function(data){
                    $scope.alerts = [
                        { type: 'success', msg: "Updated user" }
                    ];
                    $scope.selectedUser = data;
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: error.data.error }
                    ];
                });
        };

        $scope.makeActive = function(){
            $scope.selectedUser.state = 'Active';
        };

        $scope.deleteUser = function(){
            $scope.selectedUser.$delete(function(data){
                    delete $scope.selectedUser;
                    $scope.alerts = [
                        { type: 'success', msg: "Deleted " + data.email }
                    ];
                    $location.path('/user');
                },
                function(failedResponse){
                    $scope.alerts = [
                        { type: 'danger', msg: "Failed to delete: " + failedResponse.data.error }
                    ];
                }
            );
        };

        $scope.grantAccess = function(user){
            userService.grantAccess(user).then(function(data){
                    $scope.selectedUser = data;
                    $scope.alerts = [
                        { type: 'success', msg: "Granted system access to " + $scope.selectedUser.email }
                    ];
                },
                function(failedResponse){
                    $scope.alerts = [
                        { type: 'danger', msg: "Failed to grant system access to user - reason: " + failedResponse.data.error }
                    ];
                }
            );
        };

        $scope.canEdit = function(user){
            return user.state == 'Active' || user.state == 'Inactive';
        };

        $scope.userService  = userService;

        $scope.columnInfo = [
            {title: "Email", field:"email", baseLink:"#/user/view/", linkField: "_id", link:true},
            {title: "Status", field:"state"},
            {title: "Created Date", field:"createdAt", filter: "date", filterFormat: 'medium'}
        ];
    }
);