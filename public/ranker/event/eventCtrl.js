angular.module('controllers').controller('eventCtrl', function($scope,
                                                              $routeParams,
                                                              eventSvr) {
        $scope.eventSvr  = eventSvr;

        $scope.columnInfo = [
            {title: "Type", field:"type"},
            {title: "Created", field:"createdAt", filter: "fromNow"}
        ];
    }
);