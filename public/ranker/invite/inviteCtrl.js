angular.module('controllers').controller('inviteCtrl', function($scope, $routeParams, inviteSvr, $location) {

    $scope.invite = {};
    $scope.inviteSent = false;
    $scope.inviteUser = function(){
        inviteSvr.save({}, $scope.invite, function(){
                $scope.alerts = [
                    { type: 'success', msg: "Sent email invite to " + $scope.invite.email }
                ];
                $scope.inviteSent = true;
            },
            function(error){
                $scope.alerts = [
                    { type: 'danger', msg: error.data.error }
                ];
            });
    };
});
