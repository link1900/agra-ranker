angular.module('controllers').controller('GreyhoundCtrl', ['$scope', '$routeParams', 'greyhoundService', '$location',
    function($scope, $routeParams, greyhoundService, $location) {

        $scope.select2Options = {
            allowClear:true
        };

        $scope.findOne = function() {
            greyhoundService.get({
                greyhoundId: $routeParams.id
            }, function(greyhound) {
                $scope.loadGreyhound(greyhound);
            }, function(){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
                ];
            });
        };

        $scope.loadGreyhound = function(greyhound){
            console.log("hey");
            $scope.greyhound = greyhound;
            if (greyhound.sireRef) $scope.findSire(greyhound.sireRef);
            if (greyhound.damRef) $scope.findDam(greyhound.damRef);
        };

        $scope.findSire = function(sireId){
            greyhoundService.get({
                greyhoundId: sireId
            }, function(greyhound) {
                $scope.sireGreyhound = greyhound;
            }, function(){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed to load sire using the id " + sireId }
                ];
            });
        };

        $scope.findDam = function(damId){
            greyhoundService.get({
                greyhoundId: damId
            }, function(greyhound) {
                $scope.damGreyhound = greyhound;
            }, function(){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed to load dam using the id " + damId }
                ];
            });
        };

        $scope.setSire = function(){
            if ($scope.selectedSireId){
                $scope.greyhound.sireRef = $scope.selectedSireId;
                $scope.save();
            }
        };

        $scope.setDam = function(){
            if ($scope.selectedDamId){
                $scope.greyhound.damRef = $scope.selectedDamId;
                $scope.save();
            }
        };

        $scope.removeSire = function(){
            $scope.greyhound.sireRef = null;
            delete $scope.sireGreyhound;
            $scope.save();
        };

        $scope.removeDam = function(){
            $scope.greyhound.damRef = null;
            delete $scope.damGreyhound;
            $scope.save();
        };

        $scope.loadGreyhounds = function() {
            if (!$scope.greyhounds){
                greyhoundService.query(function(greyhounds) {
                    $scope.greyhounds = greyhounds;
                });
            }
        };

        $scope.create = function(){
            greyhoundService.save({}, $scope.greyhound, function(response){
                $location.path('greyhound/view/'+ response._id);
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
                    $scope.loadGreyhound(data);
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "Failed to update: " + error.data }
                    ];
                });
        };

        $scope.deleteGreyhound = function(){
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