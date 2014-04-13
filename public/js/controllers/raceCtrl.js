angular.module('controllers').controller('RaceCtrl', ['$scope', '$routeParams', 'headerHelperService', 'raceService', '$location', 'groupLevelService',
    function($scope, $routeParams, headerHelperService, raceService, $location, groupLevelService) {

        $scope.findOne = function() {
            raceService.get({
                raceId: $routeParams.id
            }, function(model) {
                $scope.load(model);
            }, function(){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
                ];
            });
        };

        $scope.load = function(model){
            $scope.race = model;
            $scope.postProcess($scope.race);
        };

        $scope.postProcess = function(model) {
            if ($scope.groupLevels) {
                model.groupLevel = $scope.groupLevelNameLookup(model.groupLevelRef, $scope.groupLevel);
            } else {
                groupLevelService.query({
                    page : 1,
                    per_page : 50,
                    sort_field: 'name',
                    sort_direction: 'asc'
                }, function(groupLevels){
                    $scope.groupLevels = groupLevels;
                    model.groupLevel = $scope.groupLevelNameLookup(model.groupLevelRef, groupLevels);
                });
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

        $scope.raceService = raceService;

        $scope.dateOptions = {
            'show-weeks': false
        };

        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

        $scope.columnInfo = [
            {title: "Name", field:"name", baseLink:"#/race/view/", linkField: "_id", link:true},
            {title: "Date", field:"date", filter: "date", filterFormat: 'dd MMMM yyyy'},
            {title: "Group Level", field:"groupLevel"}
        ];

        $scope.create = function(){
            if ($scope.race.disqualified == undefined){
                $scope.race.disqualified = false;
            }
            raceService.save({}, $scope.race, function(response){
                    $location.path('race/view/'+ response._id);
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
                    $scope.load(data);
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "update " + error.data.error }
                    ];
                });
        };

        $scope.deleteEntity = function(){
            $scope.race.$delete(function(data){
                    delete $scope.batch;
                    $scope.alerts = [
                        { type: 'success', msg: "Deleted " + data.name.toUpperCase() }
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
    }
]);