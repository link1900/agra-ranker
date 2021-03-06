angular.module('controllers').controller('GreyhoundCtrl', ['$scope', '$routeParams', 'headerHelperService', 'greyhoundSvr', '$location', '$q',
    function($scope, $routeParams, headerHelperService, greyhoundSvr, $location, $q) {

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
            {"name":"Name", field:"like", type:"text"},
            {"name":"Date range", type:"dateRange"}
        ];

        $scope.exportInfo = [
            {label: "csv", link: "/greyhound.csv"}
        ];

        $scope.findOne = function() {
            if ($routeParams.id) {
                greyhoundSvr.get({
                    greyhoundId: $routeParams.id
                }, function(greyhound) {
                    $scope.loadGreyhound(greyhound);
                }, function(){
                    $scope.loadGreyhound({});
                });
            } else {
                $scope.loadGreyhound({});
            }
        };

        $scope.loadGreyhound = function(greyhound){
            $scope.greyhound = greyhound;
            if (greyhound != null && greyhound.sireName != null){
                $scope.sireName = greyhound.sireName;
            }
            if (greyhound != null && greyhound.damName != null){
                $scope.damName = greyhound.damName;
            }
        };

        $scope.createGreyhound = function(greyhound){
            greyhoundSvr.save({}, greyhound).$promise.then(function(result){
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
            if ($scope.greyhound._id != null){
                $scope.saveSire($scope.greyhound)
                    .then($scope.saveDam)
                    .then($scope.saveGreyhound);
            } else {
                $scope.saveSire($scope.greyhound)
                    .then($scope.saveDam)
                    .then($scope.createGreyhound);
            }
        };

        $scope.saveSire = function(greyhound){
            if ($scope.sireName != null && $scope.sireName.length > 0){
                return greyhoundSvr.findOrCreateGreyhound($scope.sireName).then(function(sireGreyhound){
                    greyhound.sireRef = sireGreyhound._id;
                    return greyhound;
                });
            } else {
                greyhound.sireRef = null;
                greyhound.sireName = null;
                return $q.when(greyhound);
            }
        };

        $scope.saveDam = function(greyhound){
            if ($scope.damName != null && $scope.damName.length > 0){
                return greyhoundSvr.findOrCreateGreyhound($scope.damName).then(function(damGreyhound){
                    greyhound.damRef = damGreyhound._id;
                    return greyhound;
                });
            } else {
                greyhound.damRef = null;
                greyhound.damName = null;
                return $q.when(greyhound);
            }
        };

        $scope.saveGreyhound = function(greyhound){
            greyhound.$update(function(data){
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

        $scope.getExternalGreyhoundInfo = function(){
            if ($scope.greyhound){
                greyhoundSvr.lookupExternalData($scope.greyhound._id).then(function(result){
                    if (!$scope.greyhound.sireRef){
                        $scope.sireName = result.sireName;
                    }
                    if(!$scope.greyhound.damRef){
                        $scope.damName = result.damName;
                    }
                    if(!$scope.greyhound.color){
                        $scope.greyhound.color = result.color;
                    }
                    if(!$scope.greyhound.gender){
                        $scope.greyhound.gender = result.gender;
                    }
                    if(!$scope.greyhound.dateOfBirth){
                        $scope.greyhound.dateOfBirth = result.dateOfBirth;
                    }
                    return result;
                });
            }
        }
    }
]);