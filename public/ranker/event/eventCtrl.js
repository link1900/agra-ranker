angular.module('controllers').controller('eventCtrl', function($scope,
                                                              $routeParams,
                                                              eventSvr) {
        $scope.eventSvr  = eventSvr;

        $scope.columnInfo = [
            {title: "Type", field:"type"},
            {title: "Event time", field:"createdAt", filter: "fromNow", filterFormat: "bothMed"}
        ];
    }
);