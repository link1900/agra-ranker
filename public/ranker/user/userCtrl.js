angular.module('controllers').controller('userCtrl', function($scope,
                                                              $routeParams,
                                                              userService,
                                                              rankerEventBus,
                                                              securityService,
                                                              $location,
                                                              $window) {
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
        $scope.passwordChange = {};
        $scope.submitPasswordChange = function(){
            if ($scope.passwordChange.existingPassword != null && $scope.passwordChange.newPassword != null && $scope.passwordChange.confirmPassword != null){
                if ($scope.passwordChange.newPassword == $scope.passwordChange.confirmPassword){
                    userService.changePassword($scope.passwordChange).then(function(){
                            $scope.alerts = [
                                { type: 'success', msg: "Your password has been updated"}
                            ];
                            $scope.passwordChange = {};
                        },
                        function(failedResponse){
                            $scope.alerts = [
                                { type: 'danger', msg: "Failed to update your password - reason: " + failedResponse.data.error }
                            ];
                        }
                    );
                } else {
                    $scope.alerts = [
                        { type: 'danger', msg: "Your new password and confirmed passwords do not match"}
                    ];
                }
            } else {
                $scope.alerts = [
                    { type: 'danger', msg: "You must complete all fields"}
                ];
            }
        };

        $scope.submitPasswordChangeToken = function(){
            if ($scope.passwordChange.newPassword != null && $scope.passwordChange.confirmPassword != null){
                if ($scope.passwordChange.newPassword == $scope.passwordChange.confirmPassword){
                    userService.changePasswordToken($routeParams.token, $scope.passwordChange).then(function(){
                            $scope.alerts = [
                                { type: 'success', msg: "Your password has been updated"}
                            ];
                            $scope.passwordChange = {};
                            $scope.passwordChanged = true;
                        },
                        function(failedResponse){
                            $scope.alerts = [
                                { type: 'danger', msg: "Failed to update your password - reason: " + failedResponse.data.error }
                            ];
                        }
                    );
                } else {
                    $scope.alerts = [
                        { type: 'danger', msg: "Your new password and confirmed passwords do not match"}
                    ];
                }
            } else {
                $scope.alerts = [
                    { type: 'danger', msg: "You must complete all fields"}
                ];
            }
        };

        $scope.checkToken = function(){
            userService.findToken($routeParams.token).then(function(){
                    $scope.tokenStatus = 'valid';
                },
                function(failedResponse){
                    $scope.tokenStatus = 'invalid';
                }
            );
        };
        $scope.passwordResetSent = false;
        $scope.sendForgotPasswordRequest = function(){
            userService.forgotPassword($scope.forgot).then(function(data){
                    $scope.alerts = [
                        { type: 'primary', msg: "We have sent an email to " + $scope.forgot.email + " with further instructions" }
                    ];
                    $scope.passwordResetSent = true;
                },
                function(failedResponse){
                    $scope.alerts = [
                        { type: 'danger', msg: failedResponse.data.error }
                    ];
                }
            );
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
        $scope.signUpUser ={};
        $scope.signUp = function(){
            userService.signUp($scope.signUpUser).then(function(createdUser){
                if (createdUser.state == "Active"){
                    $location.path('/login');
                    window.location.reload(true);
                } else {
                    $scope.registeredSuccess = true;
                }
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
                    console.log(error.data);
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

        $scope.resetPassword = function(user){
            userService.resetPassword(user).then(function(data){
                    $scope.alerts = [
                        { type: 'success', msg: "Sent password reset email to " + user.email }
                    ];
                },
                function(failedResponse){
                    $scope.alerts = [
                        { type: 'danger', msg: "Failed reset password - reason: " + failedResponse.data.error }
                    ];
                }
            );
        };

        $scope.canEdit = function(user){
            if (user != null && user.state != null){
                return user.state == 'Active' || user.state == 'Inactive';
            }
        };

        $scope.showPasscode = false;

        $scope.signUpPrep = function(){
            if($routeParams.token){
                $scope.signUpUser.inviteToken = $routeParams.token;
            }

            userService.isInBootstrap().then(function(data){
                $scope.showPasscode = data.result;
            });
        };

        $scope.userService  = userService;

        $scope.columnInfo = [
            {title: "Email", field:"email", baseLink:"#/user/view/", linkField: "_id", link:true},
            {title: "First Name", field:"firstName"},
            {title: "Last Name", field:"lastName"},
            {title: "Status", field:"state"},
            {title: "Created Date", field:"createdAt", filter: "date", filterFormat: 'medium'}
        ];
    }
);