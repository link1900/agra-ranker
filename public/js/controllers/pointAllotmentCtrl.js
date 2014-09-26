angular.module('controllers').controller('PointAllotmentCtrl',
    function($scope, $routeParams, headerHelperService, pointAllotmentService) {
        $scope.pointAllotmentService = pointAllotmentService;

        $scope.columnInfo = [
            {title: "Greyhound", field:"placing.greyhound.name", baseLink:"#/greyhound/view/", linkField: "placing.greyhoundRef", link:true, filter: "uppercase"},
            {title: "Race", field:"placing.race.name",  baseLink:"#/race/view/", linkField: "placing.raceRef", link:true},
            {title: "Placing", field:"placing.placing"},
            {title: "Points", field:"points"}
        ];
    }
);