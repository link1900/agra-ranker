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
        {"name":"Year", fieldStart:"startDate", fieldEnd:"endDate", selectedStart: "start", selectedEnd:"end", type:"selectRangeSingle",  options: [], loadOptions: function(){
            var startYear = 2010;
            var endYear = new Date().getFullYear();
            var periods = [];
            for (var i=endYear; i>=startYear;i--){
                periods.push({name: i+"", _id: $scope.getYearDates(i)});
                //periods.push({name: i+"-"+(i+1), period: $scope.getFYearDates(i)});
            }
            return $q.when(periods);
        }},
        {"name":"Type", field:"rankingSystemRef", type:"select", options: [], loadOptions: function(){
            return rankingSystemSvr.query($scope.rankingSystemSearch).$promise;
        }}
    ];

    $scope.getFYearDates = function(year){
        var midYear = moment().set('year', year).set('month', 'July').set('date', 1).startOf('day');
        return { start: midYear.toDate(), end : midYear.clone().add(12, 'months').subtract(1, 'days').endOf('day').toDate()};
    };

    $scope.getYearDates = function(year){
        var startYear = moment().set('year',year).set('month', 'Jan').set('date', 1).startOf('day');
        var endYear = moment().set('year',year).set('month', 'Dec').set('date', 31).endOf('day');
        return {start: startYear.toString(), end: endYear.toString()};
    };

    $scope.loadRankingSystems = function(){
        rankingSystemSvr.query($scope.rankingSystemSearch, function(resultModels) {
            $scope.searchInfo[1].options = resultModels;
            $scope.searchInfo[1].selected = $scope.searchInfo[1].options[0]._id;
            console.log("i updated the selection", $scope.searchInfo[1].selected);
        });
    };
});