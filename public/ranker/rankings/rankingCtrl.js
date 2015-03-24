angular.module('controllers').controller('rankingCtrl', function($scope, rankingSvr, rankingSystemSvr, $q) {
    $scope.rankingService = rankingSvr;
    $scope.selected = {};
    $scope.columnInfo = [
        {title: "Rank", field:"rank"},
        {title: "Greyhound", field:"greyhoundName", type:"link", baseLink:"#/greyhound/view/", linkField: "greyhoundRef", filter: "uppercase"},
        {title: "Points", field:"totalPoints", type: "template", template:"/ranker/rankings/pointDetails.html" }
    ];
    $scope.rankingSystems = [];
    $scope.periods = [];
    $scope.rankingSystemSearch = {
        page : 1,
        per_page : 15,
        sort_field: 'name',
        sort_direction: 'asc'
    };

    $scope.searchInfo = [
        {"name":"Ranking for period", type:"dateRange"},
        {"name":"Type", field:"rankingSystemRef", type:"select", options: [], loadOptions: function(){
            return rankingSystemSvr.query($scope.rankingSystemSearch).$promise;
        }}
    ];
});