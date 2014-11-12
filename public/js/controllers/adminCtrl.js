angular.module('controllers').controller('adminCtrl', function($scope, $http) {

    $scope.removeAll = function(collection){
        $http.delete('/admin/drop/'+collection).then(function(){
            $scope.loadCounts();
            $scope.alerts = [
                { type: 'success', msg: "Deleted all "+ collection+ "s" }
            ];
        }, function(res){
            $scope.alerts = [
                { type: 'danger', msg: "Failed to delete "+ collection+ "s: " + res.data.error }
            ];
        });
    };

    $scope.loadCounts = function(){
        $http.get('/admin/count').then(function(result){
            if (result != null && result.data != null){
                $scope.counts = result.data;
            }
        }, function(res){
            console.log("failed to load counts" + res);
        });
    };

    $scope.counts = {};
    $scope.loadCounts();
});