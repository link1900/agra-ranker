angular.module('controllers').controller('GreyhoundCtrl', ['$scope', '$routeParams', 'headerHelperService', 'greyhoundService', '$location',
    function($scope, $routeParams, headerHelperService, greyhoundService, $location) {

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

        $scope.postProcessing = function(greyhound){
            $scope.loadSire(greyhound);
            $scope.loadDam(greyhound);
            $scope.loadOffspring(greyhound);
        };

        $scope.postProcessingCollection = function(greyhounds){
            _.each(greyhounds, function(grey){
                $scope.loadSire(grey);
                $scope.loadDam(grey);
            });
        };

        $scope.loadSire = function(greyhound){
            if (greyhound.sireRef){
                greyhoundService.get({
                    greyhoundId: greyhound.sireRef
                }, function(foundGreyhound) {
                    greyhound.sire = foundGreyhound;
                });
            }
        };

        $scope.loadOffspring = function(greyhound){
            greyhoundService.offspring(greyhound._id,
                function(data){
                    greyhound.offspring = data;
                }
            );
        };

        $scope.loadDam = function(greyhound){
            if (greyhound.damRef){
                greyhoundService.get({
                    greyhoundId: greyhound.damRef
                }, function(foundGreyhound) {
                    greyhound.dam = foundGreyhound;
                });
            }
        };

        $scope.loadGreyhound = function(greyhound){
            $scope.greyhound = greyhound;
            $scope.postProcessing($scope.greyhound);
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
            delete $scope.greyhound.sire;
            $scope.save();
        };

        $scope.removeDam = function(){
            $scope.greyhound.damRef = null;
            delete $scope.greyhound.dam;
            $scope.save();
        };

        $scope.searchParams = {
            page : 1,
            per_page : 10,
            sort_field: 'name',
            sort_direction: 'asc',
            like : ''
        };

        $scope.updateSearch = function(){
            $scope.loadGreyhounds();
        };

        $scope.changePage = function(page){
            $scope.searchParams.page = page;
            $scope.loadGreyhounds();
        };

        $scope.loadGreyhounds = function() {
            greyhoundService.query($scope.searchParams, function(greyhounds, headers) {
                $scope.greyhounds = greyhounds;
                $scope.postProcessingCollection(greyhounds);
                $scope.totalItems = headerHelperService.totalItemsFromHeader(headers());
            });
        };

        $scope.loadGreyhoundsForSelection = function() {
            $scope.searchParams.per_page = 1000;
            greyhoundService.query($scope.searchParams, function(greyhounds) {
                $scope.greyhounds = greyhounds;
            });
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

    }
]);