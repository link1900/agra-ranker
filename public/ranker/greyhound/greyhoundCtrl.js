angular.module('controllers').controller('GreyhoundCtrl', ['$scope', '$routeParams', 'headerHelperService', 'greyhoundSvr', '$location',
    function($scope, $routeParams, headerHelperService, greyhoundSvr, $location) {

        $scope.select2Options = {
            allowClear:true
        };

        $scope.greyhoundSvr = greyhoundSvr;

        $scope.offspringColumnInfo = [
            {title: "Name", field:"name", baseLink:"#/greyhound/view/", linkField: "_id", link:true, filter: "uppercase"}
        ];

        $scope.offspringSearchFields = [
            {"name":"parentRef", field:"parentRef", value:$routeParams.id, type:"hidden"}
        ];

        $scope.columnInfo = [
            {title: "Name", field:"name", baseLink:"#/greyhound/view/", linkField: "_id", link:true, filter: "uppercase"},
            {title: "Sire", field:"sire.name", baseLink:"#/greyhound/view/", linkField: "sireRef", link:true, filter: "uppercase"},
            {title: "Dam", field:"dam.name", baseLink:"#/greyhound/view/", linkField: "damRef", link:true, filter: "uppercase"}
        ];

        $scope.searchInfo = [
            {"name":"Name", field:"like", type:"text"}
        ];

        $scope.findOne = function() {
            greyhoundSvr.get({
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
                greyhoundSvr.get({
                    greyhoundId: greyhound.sireRef
                }, function(foundGreyhound) {
                    greyhound.sire = foundGreyhound;
                });
            }
        };

        $scope.loadDam = function(greyhound){
            if (greyhound.damRef){
                greyhoundSvr.get({
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
            greyhoundSvr.save({}, $scope.greyhound).$promise.then(function(result){
                $location.path('greyhound/edit/'+ result._id);
            }, function(error){
                $scope.alerts = [
                    { type: 'danger', msg: error.data.error }
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
                    $scope.loadGreyhound(data);
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: error.data.error }
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

        $scope.searchGreyhounds = [];

        $scope.refreshGreyhoundSearch = function(val){
            var searchParams = {
                page : 1,
                per_page : 10,
                sort_field: 'name',
                sort_direction: 'asc',
                like : val
            };

            $scope.greyhoundSvr.query(searchParams, function(resultModels, headers) {
                $scope.searchGreyhounds = resultModels;
            });
        };

        $scope.clearSire = function(){
            if ($scope.greyhound != null && $scope.greyhound.sireRef != null){
                $scope.greyhound.sireRef = null;
                $scope.greyhound.sire = null;
            }
        };

        $scope.clearDam = function(){
            if ($scope.greyhound != null && $scope.greyhound.damRef != null){
                $scope.greyhound.damRef = null;
                $scope.greyhound.dam = null;
            }
        };
    }
]);