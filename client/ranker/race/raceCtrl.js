angular.module('controllers').controller('RaceCtrl', ['$scope', '$routeParams', 'headerHelperService', 'raceSvr', '$location', 'generalService',
    function($scope, $routeParams, headerHelperService, raceSvr, $location, generalService) {

        $scope.showNoRaceInfo = false;

        $scope.findOne = function() {
            raceSvr.get({
                raceId: $routeParams.id
            }, function(model) {
                $scope.loadRace(model);
            }, function(){
                $scope.loadRace({});
            });
        };

        $scope.loadRace = function(model){
            $scope.race = model;
        };

        $scope.loadForm = function(){
            $scope.groupLevels = ["Group 1", "Group 2", "Group 3", "Listed"];
        };

        $scope.distanceSearch = function(val) {
            return generalService.getDistances().then(function(result){
                result = result.map(function(item){
                    return item.toString();
                });

                result = _.filter(result, function(item){
                    return item.indexOf(val) != -1;
                });

                return result;
            })
        };

        $scope.raceSvr = raceSvr;

        $scope.columnInfo = [
            {title: "Name", field:"name", type:"link", baseLink:"#/race/view/", linkField: "_id"},
            {title: "Date", field:"date", filter: "date", filterFormat: 'dd MMMM yyyy'},
            {title: "Group Level", field:"groupLevelName"},
            {title: "Distance (meters)", field:"distanceMeters"}
        ];

        $scope.searchInfo = [
            {"name":"Name", field:"like", type:"text"},
            {"name":"Date Range", type:"dateRange"}
        ];

        $scope.exportInfo = [
            {label: "csv", link: "/race.csv"}
        ];

        $scope.create = function(){
            if ($scope.race.disqualified == undefined){
                $scope.race.disqualified = false;
            }
            raceSvr.save({}, $scope.race, function(response){
                    $location.path('race/edit/'+ response._id);
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "create " + error.data.error }
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
            if ($scope.race._id){
                $scope.update();
            } else {
                $scope.create();
            }
        };

        $scope.update = function(){
            $scope.race.$update(function(data){
                    $scope.alerts = [
                        { type: 'success', msg: "Updated " + data.name }
                    ];
                    $scope.loadRace(data);
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "update " + error.data.error }
                    ];
                });
        };

        $scope.deleteEntity = function(){
            $scope.race.$delete(function(data){
                    delete $scope.race;
                    $scope.alerts = [
                        { type: 'success', msg: "Deleted " + data.name }
                    ];
                    $location.path('/race');
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "delete " + error.data }
                    ];
                }
            );
        };

        $scope.loadForm();
    }
]);