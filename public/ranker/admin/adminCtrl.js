angular.module('controllers').controller('adminCtrl', function($scope, $http) {
    $scope.counts = {};
    $scope.removeCollections = ['greyhound', 'batch', 'file', 'groupLevel'];
    $scope.setupCollections = ['groupLevel'];

    $scope.loadCounts = function(){
        $http.get('/admin/count').then(function(result){
            if (result != null && result.data != null){
                $scope.counts = result.data;
            }
        }, function(res){
            console.log("failed to load counts" + res);
        });
    };

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

    $scope.setupDefaults = function(collection){
        $http.post('/admin/setup/'+collection).then(function(){
            $scope.loadCounts();
            $scope.alerts = [
                { type: 'success', msg: "Setup defaults for "+ collection+ "s" }
            ];
        }, function(res){
            $scope.alerts = [
                { type: 'danger', msg: "Failed to setup defaults for "+ collection+ "s: " + res.data.error }
            ];
        });
    };

    $scope.loadCounts();
});