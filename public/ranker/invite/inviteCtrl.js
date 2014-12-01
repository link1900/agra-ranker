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

    $scope.deleteAllExpiredInvite = function(){
        inviteSvr.deleteAllExpired().then(function(){
            $scope.alerts = [
                { type: 'success', msg: "Deleted expired invites"}
            ];
        }, function(failedResult){
            $scope.alerts = [
                { type: 'danger', msg: "Failed to delete: " + failedResult.error}
            ];
        });
    };

    $scope.findOne = function() {
        inviteSvr.get({
            inviteId: $routeParams.id
        }, function(found) {
            $scope.selectedInvite = found;
        }, function(){
            $scope.alerts = [
                { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
            ];
        });
    };

    $scope.deleteInvite = function(){
        $scope.selectedInvite.$delete(function(data){
                delete $scope.selectedInvite;
                $scope.alerts = [
                    { type: 'success', msg: "Deleted " + data.email }
                ];
                $location.path('/invite');
            },
            function(failedResponse){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed to delete: " + failedResponse.data.error }
                ];
            }
        );
    };

    $scope.inviteSvr = inviteSvr;
    $scope.columnInfo = [
        {title: "Email", field:"email", baseLink:"#/invite/view/", linkField: "_id", link:true},
        {title: "Token", field:"token"},
        {title: "Created Date", field:"createdAt", filter: "date", filterFormat: 'medium'}
    ];
});
