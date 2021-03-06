angular.module('controllers').controller('rankingCtrl', function($scope, rankingSvr, rankingSystemSvr) {
    $scope.rankingService = rankingSvr;
    $scope.selected = {};
    $scope.columnInfo = [
        {title: "Rank", field:"rank"},
        {title: "Greyhound", field:"greyhoundName", type:"link", baseLink:"#/greyhound/view/", linkField: "greyhoundRef"},
        {title: "Points", field:"totalPoints", type: "template", template:"/ranker/rankings/pointDetails.html" }
    ];
    $scope.exportInfo = [
        {label: "csv", link: "/ranking.csv"},
        {label: "csv in columns", link: "/ranking.grid.csv"}
    ];

    $scope.rankingSystems = [];
    $scope.periods = [];
    $scope.rankingSystemSearch = {
        page : 1,
        per_page : 15,
        sort_field: 'createdAt',
        sort_direction: 'asc'
    };

    $scope.searchInfo = [
        {"name":"Ranking for period", type:"dateRange", defaultStartDate: moment().startOf('year').toDate(), defaultEndDate: moment().endOf('year').toDate()},
        {"name":"Type", field:"rankingSystemRef", type:"select", options: [], loadOptions: function(){
            return rankingSystemSvr.query($scope.rankingSystemSearch).$promise;
        }}
    ];
});