angular.module('controllers').controller('PlacingCtrl', function($scope,
                                                                 $routeParams,
                                                                 headerHelperService,
                                                                 $location,
                                                                 placingSvr,
                                                                 greyhoundSvr, $q,
                                                                 raceSvr) {

    $scope.placingSvr = placingSvr;

    $scope.placings = [];
    $scope.placingAlerts = [];
    $scope.selection = {};
    $scope.raceRef = $routeParams.id;
    $scope.greyhoundRef = $routeParams.id;

    $scope.formMode = 'view';
    $scope.showEditForm = false;
    $scope.placingToEdit = null;

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
            $scope.updatePlacingsIfNeeded();
        }
    };

    $scope.greyhoundPlacingColumns =[
        {title: "Placing", field:"placing"},
        {title: "Race", field:"race.name", type:"link", baseLink:"#/race/view/", linkField: "raceRef"},
        {title: "Race Date", field:"race.date", filter: "date", filterFormat: 'dd MMMM yyyy'},
        {title: "Group Level", field:"race.groupLevelName"},
        {title: "Distance (meters)", field:"race.distanceMeters"}
    ];

    $scope.greyhoundSearchFields = [
        {"name":"greyhoundRef", field:"greyhoundRef", value:$routeParams.id, type:"hidden"}
    ];

    $scope.racePlacingColumns =[
        {title: "Placing", field:"placing"},
        {title: "Name", field:"greyhound.name", type:"link", baseLink:"#/greyhound/view/", linkField: "greyhoundRef"},
        {title: "Sire", field:"greyhound.sireName", type:"link", baseLink:"#/greyhound/view/", linkField: "sireRef"},
        {title: "Dam", field:"greyhound.damName", type:"link", baseLink:"#/greyhound/view/", linkField: "damRef"}
    ];

    $scope.raceSearchFields = [
        {"name":"raceRef", field:"raceRef", value:$routeParams.id, type:"hidden"}
    ];

    $scope.loadPlacingsForRace = function(){
        placingSvr.query({raceRef: $routeParams.id}, function(placings) {
            $scope.placings = placings;
            var groupedPlacings = _.groupBy(placings, 'placing');
            $scope.placingSets = _.map($scope.placingDefinitions, function(placingSet){
                if (groupedPlacings[placingSet.placingValue]){
                    placingSet.placings = groupedPlacings[placingSet.placingValue];
                } else {
                    placingSet.placings = [];
                }

                return placingSet;
            });
        });
    };

    $scope.clearNewGreyhound = function(){
        $scope.selection = {};
    };

    $scope.removePlacing = function(placingSet, placing){
        placingSvr.deletePlacing(placing).then(function(){
            placingSet.placings.splice(placingSet.placings.indexOf(placing), 1);
        },function(){
            $scope.placingAlerts = [
                { type: 'danger', msg: "Failed to delete placing" }
            ];
        });
    };

    $scope.savePlacingModel = function(placingModel){
        return placingSvr.savePlacing(placingModel).then(function(savedPlacing){
            return savedPlacing;
        }, function(){
            $scope.placingAlerts.push({ type: 'danger', msg: "Failed to save placing."});
            return $q.reject(null);
        });
    };

    $scope.updatePlacingsIfNeeded = function(){
        var toUpdate = [];
        _.each($scope.placingSets, function(placingSet){
            _.each(placingSet.placings, function(placing){
                if (placing.placing !== placingSet.placingValue){
                    placing.placing = placingSet.placingValue;
                    toUpdate.push(placing);
                }
            })
        });

        if (toUpdate.length > 0){
            _.each(toUpdate, $scope.savePlacingModel);
        }
    };

    $scope.addPlacing = function(){
        $scope.placingAlerts = [];
        if ($scope.selection.newGreyhoundName && $scope.selection.newGreyhoundName.length > 0){
            greyhoundSvr.findOrCreateGreyhound($scope.selection.newGreyhoundName).then(function(newGreyhound){
                if (newGreyhound){
                    var newPlacing = {};
                    var nextPlacingPosition = $scope.getNextPlacingPosition();
                    newPlacing.placing = nextPlacingPosition;
                    newPlacing.greyhoundRef = newGreyhound._id;
                    newPlacing.raceRef = $scope.raceRef;

                    $scope.savePlacingModel(newPlacing).then(function(createdPlacing){
                        if (createdPlacing){
                            var placingSetToInsertInto = $scope.getPlacingSetForPlacingValue(nextPlacingPosition);
                            if (placingSetToInsertInto && placingSetToInsertInto.placings){
                                placingSetToInsertInto.placings.push(createdPlacing);
                                $scope.clearNewGreyhound();
                            } else {
                                $scope.placingAlerts.push({ type: 'danger', msg: "Failed to create placing"});
                            }
                        } else {
                            $scope.placingAlerts.push({ type: 'danger', msg: "Failed to create placing"});
                        }
                    });
                } else {
                    $scope.placingAlerts.push({ type: 'danger', msg: "Failed to create placing"});
                }
            });
        }
    };

    $scope.editPlacing = function(placing){
        $scope.placingAlerts = [];
        $scope.placingToEdit = placingSvr.get({placingId:placing._id});
        $scope.showEditForm = true;
    };

    $scope.clearPlacingEdit = function(){
        $scope.placingAlerts = [];
        $scope.showEditForm = false;
        $scope.placingToEdit = null;
    };

    $scope.savePlacingEdit = function(){
        $scope.savePlacingModel($scope.placingToEdit).then(function(){
            $scope.clearPlacingEdit();
        });
    };

    $scope.getPlacingSetForPlacingValue = function(placingValue){
        return _.find($scope.placingSets, function(placingSet){
            return placingSet.placingValue === placingValue;
        });
    };

    $scope.getNextPlacingPosition = function(){
        var found = _.find($scope.placingSets, function(placingSet){
            return placingSet.placings.length == 0;
        });

        if (found){
            return found.placingValue;
        } else {
            return "1";
        }
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
});