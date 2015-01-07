angular.module('controllers').controller('rankingCtrl', function($scope, rankingService) {
    $scope.rankingService = rankingService;

    $scope.columnInfo = [
        {title: "Points", field:"totalPoints"}
    ];
});