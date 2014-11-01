angular.module('controllers').controller('adminCtrl', function($scope, $http) {

    $scope.removeAllGreyhounds = function(){
        $http.delete('/admin/greyhound').then(function(){
            $scope.alerts = [
                { type: 'success', msg: "Deleted all greyhounds" }
            ];
        }, function(res){
            $scope.alerts = [
                { type: 'danger', msg: "Failed to delete greyhounds: " + res.data.error }
            ];
        });
    };

});