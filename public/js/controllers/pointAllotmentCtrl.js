angular.module('controllers').controller('PointAllotmentCtrl',
    function($scope, $routeParams, headerHelperService, pointAllotmentService, $location) {
        $scope.pointAllotmentService = pointAllotmentService;

        $scope.columnInfo = [
            {title: "Points", field:"points"}
        ];
    }
);