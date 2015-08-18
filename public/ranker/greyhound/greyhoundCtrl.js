angular.module('controllers').controller('GreyhoundCtrl', ['$scope', '$routeParams', 'headerHelperService', 'greyhoundSvr', '$location',
    function($scope, $routeParams, headerHelperService, greyhoundSvr, $location) {

        $scope.select2Options = {
            allowClear:true
        };

        $scope.greyhoundSvr = greyhoundSvr;

        $scope.offspringColumnInfo = [
            {title: "Name", field:"name", type:"link", baseLink:"#/greyhound/view/", linkField: "_id"}
        ];

        $scope.offspringSearchFields = [
            {"name":"parentRef", field:"parentRef", value:$routeParams.id, type:"hidden"}
        ];

        $scope.columnInfo = [
            {title: "Name", field:"name", type:"link", baseLink:"#/greyhound/view/", linkField: "_id"},
            {title: "Sire", field:"sireName", type:"link", baseLink:"#/greyhound/view/", linkField: "sireRef"},
            {title: "Dam", field:"damName", type:"link", baseLink:"#/greyhound/view/", linkField: "damRef"}
        ];

        $scope.searchInfo = [
            {"name":"Name", field:"like", type:"text"}
        ];

        $scope.exportInfo = [
            {label: "csv", link: "/greyhound.csv"}
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

        $scope.loadGreyhound = function(greyhound){
            $scope.greyhound = greyhound;
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
                        { type: 'success', msg: "Updated " + data.name}
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
                        { type: 'success', msg: "Deleted " + data.name }
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
                $scope.greyhound.sireName = null;
            }
        };

        $scope.clearDam = function(){
            if ($scope.greyhound != null && $scope.greyhound.damRef != null){
                $scope.greyhound.damRef = null;
                $scope.greyhound.damName = null;
            }
        };
    }
]);