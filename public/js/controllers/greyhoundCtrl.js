angular.module('controllers').controller('GreyhoundCtrl', ['$scope', '$routeParams', 'headerHelperService', 'greyhoundService', '$location',
    function($scope, $routeParams, headerHelperService, greyhoundService, $location) {

        $scope.select2Options = {
            allowClear:true
        };

        $scope.greyhoundService = greyhoundService;

        $scope.offspringColumnInfo = [
            {title: "Name", field:"name", baseLink:"#/greyhound/view/", linkField: "_id", link:true, filter: "uppercase"}
        ];

        $scope.offspringSearchFields = {
            'parentRef': $routeParams.id
        };

        $scope.columnInfo = [
            {title: "Name", field:"name", baseLink:"#/greyhound/view/", linkField: "_id", link:true, filter: "uppercase"},
            {title: "Sire", field:"sire.name", baseLink:"#/greyhound/view/", linkField: "sireRef", link:true, filter: "uppercase"},
            {title: "Dam", field:"dam.name", baseLink:"#/greyhound/view/", linkField: "damRef", link:true, filter: "uppercase"}
        ];

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
                        { type: 'danger', msg: "Failed to update: " + error.data.error }
                    ];
                });
        };

        $scope.deleteGreyhound = function(){
            $scope.greyhound.$delete(function(data){
                    delete $scope.greyhound;
                    $scope.alerts = [
                        { type: 'success', msg: "Deleted " + data.name.toUpperCase() }
                    ];
                    $location.path('/greyhound');
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "Failed to delete: " + error.data.error }
                    ];
                }
            );
        };
    }
]);