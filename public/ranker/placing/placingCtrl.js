angular.module('controllers').controller('PlacingCtrl', function($scope,
                                                                 $routeParams,
                                                                 headerHelperService,
                                                                 $location,
                                                                 placingSvr,
                                                                 greyhoundSvr,
                                                                 raceSvr) {

    $scope.placingSvr = placingSvr;

    $scope.placings = [];
    $scope.placingAlerts = [];
    $scope.selection = {};
    $scope.raceRef = $routeParams.id;
    $scope.greyhoundRef = $routeParams.id;

    $scope.formMode = 'view';

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
        connectWith: ".placing-container",
        update: function(){
            $scope.savePlacings();
        }
    };

    $scope.convertDisplayArrayToPlacingModel = function(displayArray){
        var newPlacings = [];
        _.forEach(displayArray, function(placingDisplaySet, index){
            var placingPosition = $scope.placingValueLookUp(index);
            _.forEach(placingDisplaySet, function(placingDisplay){
                newPlacings.push($scope.convertDisplayModelToPlacingModel(placingPosition, placingDisplay));
            });
        });
        return newPlacings;
    };

    $scope.convertDisplayModelToPlacingModel = function(placingPosition, displayModel){
        var newPlacing = {};
        newPlacing._id = displayModel.id;
        newPlacing.placing = placingPosition;
        newPlacing.greyhoundRef = displayModel.greyhoundRef;
        newPlacing.raceRef = $scope.raceRef;
        return newPlacing;
    };

    $scope.placingValueLookUp = function(displayIndex){
        return _.find($scope.placingDefinitions, function(pd){
          return pd.displayIndex == displayIndex;
      }).placingValue;
    };

    $scope.convertPlacingModelsToDisplayArray = function(placingModels){
        var displayArray = [];
        var groupedPlacings = _.groupBy(placingModels, 'placing');
        _.forEach($scope.placingDefinitions, function(placingDefinition){
            var placingArray = groupedPlacings[placingDefinition.displayIndex+1];
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
                    greyhoundSvr.get({
                        greyhoundId: placingDisplay.greyhoundRef
                    }, function(model) {
                        placingDisplay.name = model.name;
                    }, function(){
                        $scope.placingAlerts = [
                            { type: 'danger', msg: "Failed load using the id " + placingDisplay.greyhoundRef }
                        ];
                    });
                }
            });
        });
    };

    $scope.savePlacingModels = function(placingModels){
        $scope.placingAlerts = [];
        _.each(placingModels, $scope.savePlacingModel);
    };

    $scope.savePlacingModel = function(placingModel){
        return placingSvr.savePlacing(placingModel).then(function(savedPlacing){
            return savedPlacing._id;
        }, function(){
            $scope.placingAlerts.push({ type: 'danger', msg: "Failed to save placing."});
            return null;
        });
    };

    $scope.loadPlacingsForRace = function(){
        placingSvr.query({raceRef: $routeParams.id}, function(resultModels) {
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
        raceSvr.get({
            raceId: placing.raceRef
        }, function(model) {
            placing.race = model;
        }, function(){
            $scope.placingAlerts = [
                { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
            ];
        });
    };

    $scope.loadGreyhound = function(placing){
        greyhoundSvr.get({
            greyhoundId: placing.greyhoundRef
        }, function(model) {
            placing.greyhound = model;
        }, function(){
            $scope.placingAlerts = [
                { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
            ];
        });
    };

    $scope.greyhoundPlacingColumns =[
        {title: "Placing", field:"placing"},
        {title: "Race", field:"race.name", type:"link", baseLink:"#/race/view/", linkField: "raceRef"},
        {title: "Race Date", field:"race.date", filter: "date", filterFormat: 'dd MMMM yyyy'}
    ];

    $scope.greyhoundSearchFields = [
        {"name":"greyhoundRef", field:"greyhoundRef", value:$routeParams.id, type:"hidden"}
    ];

    $scope.racePlacingColumns =[
        {title: "Placing", field:"placing"},
        {title: "Greyhound Name", field:"greyhound.name", type:"link", baseLink:"#/greyhound/view/", linkField: "greyhoundRef"}
    ];

    $scope.raceSearchFields = [
        {"name":"raceRef", field:"raceRef", value:$routeParams.id, type:"hidden"}
    ];

    $scope.removePlacing = function(placingSetIndex, greyhoundIndex){
        var placingToRemove = $scope.placings[placingSetIndex][greyhoundIndex];

        placingSvr.deletePlacing(placingToRemove).then(function(result){
            $scope.placings[placingSetIndex].splice(greyhoundIndex, 1);
        },function(error){
            $scope.placingAlerts = [
                { type: 'danger', msg: "Failed to delete placing" }
            ];
        });
    };

    $scope.savePlacings = function(){
        var placingModels = $scope.convertDisplayArrayToPlacingModel($scope.placings);
        $scope.savePlacingModels(placingModels);
    };

    $scope.showView = function(){
        $scope.clearNewGreyhound();
    };


    $scope.validateGreyhoundName = function(greyhoundName){
        //validate the name
        if (greyhoundName == null || greyhoundName == undefined || greyhoundName.length == 0){
            $scope.placingAlerts = [
                { type: 'danger', msg: "Cannot add empty greyhound" }
            ];
            return false;
        }
        return true;
    };

    $scope.addGreyhound = function(){
        $scope.placingAlerts = [];
        if ($scope.selection.newGreyhoundName != null && $scope.selection.newGreyhoundName.length > 0){
            greyhoundSvr.findOrCreateGreyhound($scope.selection.newGreyhoundName).then(function(newGreyhound){
                if (newGreyhound != null){
                    $scope.addPlacing(newGreyhound);
                } else {
                    $scope.placingAlerts.push({ type: 'danger', msg: "Failed to create placing"});
                }
            });
        }
    };

    $scope.addPlacing = function(newGreyhound){
        var newPlacing = {
            name: newGreyhound.name,
            greyhoundRef : newGreyhound._id
        };

        var displayIndex = $scope.getNextPlacingPosition();
        var placingPosition = $scope.placingValueLookUp(displayIndex);
        var newPlacingModel = $scope.convertDisplayModelToPlacingModel(placingPosition, newPlacing);
        $scope.savePlacingModel(newPlacingModel).then(function(placingId){
            if (placingId != null){
                newPlacing.id = placingId;

                //insert the new name into the correct position on the placing sets
                $scope.placings[displayIndex].push(newPlacing);
                $scope.showView();
            }
        });
    };

    $scope.getNextPlacingPosition = function(){
        for(var i = 0; i < $scope.placings.length; i++){
            if ($scope.placings[i].length == 0){
                return i;
            }
        }
        return i;
    };

    $scope.inPlacings = function(greyhoundName){
        var result = _.find($scope.placings, function(placingSet){
            return _.find(placingSet, function(greyhound){
                return _.isEqual(greyhoundName, greyhound.name);
            });
        });
        return result != null;
    };

    $scope.clearNewGreyhound = function(){
        $scope.selection = {};
    };
});