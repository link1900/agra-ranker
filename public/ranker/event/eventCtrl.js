angular.module('controllers').controller('eventCtrl', function($scope,
                                                              $routeParams,
                                                              eventSvr) {
        $scope.eventSvr  = eventSvr;

        $scope.columnInfo = [
            {title: "Type", field:"type"},
            {title: "Description", field: "description"},
            {title: "Event time", field:"createdAt", filter: "fromNow", filterFormat: "bothMed"}
        ];

        $scope.postProcess = function(events){
            _.each(events, function(event){
                if (event != null && event.data != null){
                    if (event.data.entity != null){
                        if (event.data.entity.name != null){
                            event.description = event.data.entity.name;
                        }
                        if (event.description == null && event.data.entity.greyhound != null){
                            event.description = event.data.entity.placing + " - " + event.data.entity.greyhound.name;
                        }
                    }
                    if (event.description == null && event.data.rankingsCalculated != null){
                        event.description = "Calculated " + event.data.rankingsCalculated + " rankings";
                    }
                }
            });
        };
    }
);