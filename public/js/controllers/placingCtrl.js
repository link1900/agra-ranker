angular.module('controllers').controller('PlacingCtrl', ['$scope', '$routeParams', 'headerHelperService', '$location', 'placingService', 'greyhoundService', 'raceService',
    function($scope, $routeParams, headerHelperService, $location, placingService, greyhoundService, raceService) {

        $scope.placingService = placingService;

        $scope.placings = [];

        $scope.raceRef = $routeParams.id;
        $scope.greyhoundRef = $routeParams.id;

        $scope.formMode = 'view';

        $scope.newGreyhoundName = "";

        $scope.placingDefinitions = [
            {"displayIndex":0, "placingValue": "1", "placingLabel": "1st", "style": "placing-number"},
            {"displayIndex":1, "placingValue": "2", "placingLabel": "2nd", "style": "placing-number"},
            {"displayIndex":2, "placingValue": "3", "placingLabel": "3rd", "style": "placing-number"},
            {"displayIndex":3, "placingValue": "4", "placingLabel": "4th", "style": "placing-number"},
            {"displayIndex":4, "placingValue": "5", "placingLabel": "5th", "style": "placing-number"},
            {"displayIndex":5, "placingValue": "6", "placingLabel": "6th", "style": "placing-number"},
            {"displayIndex":6, "placingValue": "7", "placingLabel": "7th", "style": "placing-number"},
            {"displayIndex":7, "placingValue": "8", "placingLabel": "8th", "style": "placing-number"},
            {"displayIndex":8, "placingValue": "DNF", "placingLabel": "Did Not Finish", "style": "placing-text"},
            {"displayIndex":9, "placingValue": "disqualified", "placingLabel": "Disqualified", "style": "placing-text"}
        ];

        $scope.sortableOptions = {
            placeholder: "placing-greyhound-placeholder",
            connectWith: ".placing-container"
        };

        $scope.convertDisplayArrayToPlacingModel = function(displayArray){
            var newPlacings = [];
            _.forEach(displayArray, function(placingDisplaySet, index){
                var placing = $scope.placingValueLookUp(index);
                _.forEach(placingDisplaySet, function(placingDisplay){
                    var newPlacing = {};
                    newPlacing._id = placingDisplay.id;
                    newPlacing.placing = placing;
                    newPlacing.greyhoundRef = placingDisplay.greyhoundRef;
                    newPlacing.raceRef = $scope.raceRef;
                    newPlacings.push(newPlacing);
                });
            });
            return newPlacings;
        };

        $scope.placingValueLookUp = function(displayIndex){
          return _.find($scope.placingDefinitions, function(pd){return pd.displayIndex == displayIndex;}).placingValue;
        };

        $scope.convertPlacingModelsToDisplayArray = function(placingModels){
            var displayArray = [];
            var groupedPlacings = _.groupBy(placingModels, 'placing');
            _.forEach($scope.placingDefinitions, function(placingDefinition){
                var placingArray = groupedPlacings[placingDefinition.displayIndex];
                placingArray = _.map(placingArray, function(placing){
                    return {"id": placing._id, "greyhoundRef":placing.greyhoundRef};
                });
                displayArray[placingDefinition.displayIndex] = placingArray;
            });
            return displayArray;
        };

        $scope.displayModelPostProcessing = function(){
            _.forEach($scope.placings, function(placingSet){
                _.forEach(placingSet, function(placingDisplay){
                    if(!placingDisplay.name){
                        greyhoundService.get({
                            greyhoundId: placingDisplay.greyhoundRef
                        }, function(model) {
                            placingDisplay.name = model.name.toUpperCase();
                        }, function(){
                            $scope.alerts = [
                                { type: 'danger', msg: "Failed load using the id " + placingDisplay.greyhoundRef }
                            ];
                        });
                    }
                });
            });
        };

        $scope.savePlacingModels = function(placingModels){
            console.log(placingModels);
        };

        $scope.loadPlacingsForRace = function(){
            placingService.query({raceRef: $routeParams.id}, function(resultModels) {
                $scope.placings = $scope.convertPlacingModelsToDisplayArray(resultModels);
                $scope.displayModelPostProcessing();
            });
        };

        $scope.postProcessingCollectionRace = function(placings){
            _.each(placings, function(placing){
                $scope.loadRace(placing);
            });
        };

        $scope.postProcessingCollectionForGreyhound = function(placings){
            _.each(placings, function(placing){
                $scope.loadGreyhound(placing);
            });
        };

        $scope.loadRace = function(placing){
            raceService.get({
                raceId: placing.raceRef
            }, function(model) {
                placing.race = model;
            }, function(){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
                ];
            });
        };

        $scope.loadGreyhound = function(placing){
            greyhoundService.get({
                greyhoundId: placing.greyhoundRef
            }, function(model) {
                placing.greyhound = model;
            }, function(){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
                ];
            });
        };

        $scope.greyhoundPlacingColumns =[
            {title: "Placing", field:"placing"},
            {title: "Race", field:"race.name", baseLink:"#/race/view/", linkField: "raceRef", link:true},
            {title: "Race Date", field:"race.date", filter: "date", filterFormat: 'dd MMMM yyyy'}
        ];

        $scope.greyhoundSearchFields = {
            'greyhoundRef': $routeParams.id
        };

        $scope.racePlacingColumns =[
            {title: "Placing", field:"placing"},
            {title: "Greyhound Name", field:"greyhound.name", baseLink:"#/greyhound/view/", linkField: "greyhoundRef", link:true, filter: "uppercase"}
        ];

        $scope.raceSearchFields = {
            'raceRef': $routeParams.id
        };

        $scope.removePlacing = function(placingIndex, greyhoundIndex){
            $scope.placings[placingIndex].splice(greyhoundIndex, 1);
        };

        $scope.savePlacings = function(){
            var raceId = $routeParams.id;
            var placingModels = $scope.convertDisplayArrayToPlacingModel($scope.placings);
            $scope.savePlacingModels(placingModels);
        };

        $scope.showAdd = function(){
            $scope.formMode = 'add';
        };

        $scope.showView = function(){
            $scope.formMode = 'view';
        };

        $scope.showEdit = function(){
            $scope.formMode = 'edit';
        };

        $scope.addGreyhound = function(){
            var greyhoundName = $scope.newGreyhoundName;
            $scope.alerts = [];
            var done = false;
            if (greyhoundName == null || greyhoundName == undefined || greyhoundName.length == 0){
                $scope.alerts = [
                    { type: 'danger', msg: "Cannot add empty greyhound" }
                ];
                return false;
            }
            greyhoundName = greyhoundName.toUpperCase();
            if($scope.inPlacings(greyhoundName)){
                $scope.alerts = [
                    { type: 'danger', msg: "Cannot add the same greyhound" }
                ];
                return false;
            }

            for(var i = 0; i < $scope.placings.length; i++){
                if ($scope.placings[i].length == 0 && done == false){
                    $scope.placings[i].push({"name":greyhoundName});
                    done = true;
                }
            }

            if (done == false){
                $scope.placings[0].push({"name":greyhoundName});
            }

            $scope.newGreyhoundName = "";
            $scope.showView();
            return true;
        };

        $scope.inPlacings = function(greyhoundName){
            var result = _.find($scope.placings, function(placingSet){
                return _.find(placingSet, function(greyhound){
                    return _.isEqual(greyhoundName, greyhound.name);
                });
            });
            return result != null;
        };

//        $scope.create = function(){
//            placingService.save({}, $scope.placing, function(response){
//                    $location.path('placing/view/'+ response._id);
//                },
//                function(error){
//                    $scope.alerts = [
//                        { type: 'danger', msg: "create " + error.data.error }
//                    ];
//                });
//        };
//
//        $scope.isInvalid = function(formField){
//            return formField.$dirty && formField.$invalid;
//        };
//
//        $scope.isValid =  function(formField){
//            return formField.$dirty && !formField.$invalid && !$scope.hasServerErrors();
//        };
//
//        $scope.hasServerErrors = function(){
//            return _.where($scope.alerts, { 'type': 'danger' }).length > 0;
//        };
//
//        $scope.save = function(){
//            $scope.placing.$update(function(data){
//                    $scope.alerts = [
//                        { type: 'success', msg: "Updated " + data.name }
//                    ];
//                    $scope.load(data);
//                },
//                function(error){
//                    $scope.alerts = [
//                        { type: 'danger', msg: "update " + error.data.error }
//                    ];
//                });
//        };
//
//        $scope.deleteEntity = function(){
//            $scope.placing.$delete(function(data){
//                    delete $scope.batch;
//                    $scope.alerts = [
//                        { type: 'success', msg: "Deleted " + data.name.toUpperCase() }
//                    ];
//                    $location.path('/placing');
//                },
//                function(error){
//                    $scope.alerts = [
//                        { type: 'danger', msg: "delete " + error.data }
//                    ];
//                }
//            );
//        };
//
//        $scope.findOne = function() {
//            placingService.get({
//                placingId: $routeParams.id
//            }, function(model) {
//                $scope.load(model);
//            }, function(){
//                $scope.alerts = [
//                    { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
//                ];
//            });
//        };
//
//        $scope.load = function(model){
//            $scope.placing = model;
//        };
    }
]);