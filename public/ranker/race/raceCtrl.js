angular.module('controllers').controller('RaceCtrl', ['$scope', '$routeParams', 'headerHelperService', 'raceSvr', '$location', 'groupLevelService', 'generalService',
    function($scope, $routeParams, headerHelperService, raceSvr, $location, groupLevelService, generalService) {

        $scope.showNoRaceInfo = false;

        $scope.findOne = function() {
            raceSvr.get({
                raceId: $routeParams.id
            }, function(model) {
                $scope.loadRace(model);
            }, function(){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
                ];
            });
        };

        $scope.loadRace = function(model){
            $scope.race = model;
            $scope.postProcess($scope.race);
        };

        /**
         * Loads default form fields
         */
        $scope.loadForm = function(){
            $scope.loadGroupLevels();
        };

        $scope.loadGroupLevels = function(){
            groupLevelService.query({
                page : 1,
                per_page : 50,
                sort_field: 'name',
                sort_direction: 'asc'
            }, function(groupLevels){
                $scope.groupLevels = groupLevels;
            });
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

        $scope.postProcess = function(model) {
            if ($scope.groupLevels) {
                model.groupLevel = $scope.groupLevelNameLookup(model.groupLevelRef, $scope.groupLevel);
            }
        };

        $scope.groupLevelNameLookup = function(id, groupLevels){
            var groupLevel = _.find(groupLevels, function(groupLevel){
                return groupLevel._id == id;
            });
            if (groupLevel){
                return groupLevel.name;
            } else {
                return "";
            }
        };

        $scope.postProcessingCollection = function(entities){
            _.each(entities, function(entity){
                $scope.postProcess(entity);
            });
        };

        $scope.raceSvr = raceSvr;

        $scope.dateOptions = {
            'show-weeks': false
        };

        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

        $scope.columnInfo = [
            {title: "Name", field:"name", type:"link", baseLink:"#/race/view/", linkField: "_id"},
            {title: "Date", field:"date", filter: "date", filterFormat: 'dd MMMM yyyy'},
            {title: "Group Level", field:"groupLevel.name"},
            {title: "Distance (meters)", field:"distanceMeters"}
        ];

        $scope.searchInfo = [
            {"name":"Name", field:"like", type:"text"},
            {"name":"Date Range", type:"dateRange"}
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