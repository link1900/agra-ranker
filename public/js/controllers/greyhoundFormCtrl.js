angular.module('controllers').controller('GreyhoundFormCtrl', ['$scope','$http', function($scope, $http) {
    $scope.createFormOpen = false;
    $scope.toggleCreateForm = function(){
        $scope.createFormOpen = !$scope.createFormOpen;
    };

    $scope.clearForm = function(formField){
        $scope.toggleCreateForm();
        delete $scope.greyhound;
        delete $scope.alerts;
        formField.$setPristine();
    };

    $scope.save = function(){
        $http.post('/greyhound', $scope.greyhound)
            .success(function(data, status, headers, config) {
                $scope.alerts = [
                    { type: 'success', msg: "Created new greyhound " + data.name }
                ];
            })
            .error(function(data, status, headers, config) {
                $scope.alerts = [
                    { type: 'danger', msg: data }
                ];
            });
    };

    $scope.isInvalid = function(formField){
        return formField.$dirty && (formField.$invalid || $scope.hasServerErrors());
    };

    $scope.isValid =  function(formField){
        return formField.$dirty && !formField.$invalid && !$scope.hasServerErrors();
    };

    $scope.hasServerErrors = function(){
        return _.where($scope.alerts, { 'type': 'danger' }).length > 0;
    };

    $scope.greyhoundExists = _.throttle(function(greyhoundName){
        return $http.get('/greyhound', {
            params: { name: greyhoundName }
        }).then(function(res){
                return res.data != null;
            });
    }, 2000);

    $scope.greyhoundNameSearch = function(val) {
        return $scope.searchGreyhound(val).then(function(res){
            return _.chain(res.data)
                .pluck('name')
                .map(function(v){return v.toUpperCase()})
                .value();
        });
    };

    $scope.searchGreyhound = _.throttle(function(val) {
        return $http.get('/greyhound', {
            params: {like: val}
        });
    }, 1000);

    $scope.removeGreyhound = function(){
    };

}]);