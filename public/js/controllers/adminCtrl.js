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

    $scope.removeAllBatchJobs = function(){
        $http.delete('/admin/batch').then(function(){
            $scope.alerts = [
                { type: 'success', msg: "Deleted all batch jobs" }
            ];
        }, function(res){
            $scope.alerts = [
                { type: 'danger', msg: "Failed to delete batch jobs: " + res.data.error }
            ];
        });
    };

});