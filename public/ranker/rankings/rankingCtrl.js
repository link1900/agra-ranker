angular.module('controllers').controller('rankingCtrl', function($scope, rankingSvr) {
    $scope.rankingService = rankingSvr;

    $scope.columnInfo = [
        {title: "Rank", field:"rank"},
        {title: "Greyhound", field:"greyhoundName"},
        {title: "Points", field:"totalPoints"}
    ];
});