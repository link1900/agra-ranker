angular.module('controllers').controller('rankingCtrl', function($scope, rankingSvr, rankingSystemSvr) {
    $scope.rankingService = rankingSvr;
    $scope.selected = {};
    $scope.columnInfo = [
        {title: "Rank", field:"rank"},
        {title: "Greyhound", field:"greyhoundName"},
        {title: "Points", field:"totalPoints"}
    ];
    $scope.rankingSystems = [];
    $scope.rankingSystemSearch = {
        page : 1,
        per_page : 15,
        like : '',
        sort_field: 'name',
        sort_direction: 'asc'
    };

    $scope.loadRankingSystems = function(){
        rankingSystemSvr.query($scope.rankingSystemSearch, function(resultModels) {
            console.log(resultModels);
            $scope.rankingSystems = resultModels;
            $scope.selected.rankingSystemRef = $scope.rankingSystems[0]._id;
        });
    };

    $scope.loadRankingSystems();

});