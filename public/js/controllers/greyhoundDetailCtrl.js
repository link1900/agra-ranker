angular.module('controllers').controller('GreyhoundDetailCtrl', ['$scope', '$routeParams', 'greyhoundService',
    function($scope, $routeParams, greyhoundService) {

        $scope.findOne = function() {
            greyhoundService.get({
                greyhoundId: $routeParams.id
            }, function(greyhound) {
                $scope.greyhound = greyhound;
            }, function(){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
                ];
            });
        };

        $scope.isInvalid = function(formField){
            return formField.$dirty && formField.$invalid;
        };

        $scope.isValid =  function(formField){
            return formField.$dirty && !formField.$invalid && !$scope.hasServerErrors();
        };

        $scope.hasServerErrors = function(){
            return _.where($scope.alerts, { 'type': 'danger' }).length > 0;
        };

        $scope.save = function(){
            $scope.greyhound.$update(function(data){
                $scope.alerts = [
                    { type: 'success', msg: "Updated " + data.name.toUpperCase() }
                ];
            },
            function(error){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed to update: " + error.data }
                ];
            });
        };

        $scope.delete = function(){
            $scope.greyhound.$delete(function(data){
                    delete $scope.greyhound;
                    $scope.alerts = [
                        { type: 'success', msg: "Deleted " + data.name.toUpperCase() }
                    ];
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "Failed to delete: " + error.data }
                    ];
                }
            );
        };

    }]);