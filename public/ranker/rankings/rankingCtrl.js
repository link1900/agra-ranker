angular.module('controllers').controller('rankingCtrl', function($scope, rankingSvr, rankingSystemSvr) {
    $scope.rankingService = rankingSvr;
    $scope.selected = {};
    $scope.columnInfo = [
        {title: "Rank", field:"rank"},
        {title: "Greyhound", field:"greyhoundName"},
        {title: "Points", field:"totalPoints"}
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
        {"name":"Type", field:"rankingSystemRef", type:"select", options: [], selected: ""},
        {"name":"Year", fieldComplex:[{"queryName":"startDate", "selectedValue":"start", "dataType": "date"},{"queryName":"endDate", "selectedValue":"end", "dataType": "date"}], type:"select", options: [], selected: ""}
    ];

    $scope.buildPeriodList = function(){
        var startYear = 2010;
        var endYear = new Date().getFullYear();
        $scope.searchInfo[1].options = $scope.generateYearPeriods(startYear, endYear);
        if ($scope.searchInfo[1].options.length > 0){
            $scope.searchInfo[1].selected = $scope.searchInfo[1].options[0]._id;
        }
    };

    $scope.generateYearPeriods = function(startYear, inclusiveEndYear){
        var periods = [];
        for (var i=inclusiveEndYear; i>=startYear;i--){
            periods.push({name: i+"", _id: $scope.getYearDates(i)});
            //periods.push({name: i+"-"+(i+1), period: $scope.getFYearDates(i)});
        }
        return periods;
    };

    $scope.getFYearDates = function(year){
        var midYear = moment().set('year', year).set('month', 'July').set('date', 1).startOf('day');
        return { start: midYear.toDate(), end : midYear.clone().add(12, 'months').subtract(1, 'days').endOf('day').toDate()};
    };

    $scope.getYearDates = function(year){
        var startYear = moment().set('year',year).set('month', 'Jan').set('date', 1).startOf('day');
        var endYear = moment().set('year',year).set('month', 'Dec').set('date', 31).endOf('day');
        return {start: startYear.toDate(), end: endYear.toDate()};
    };

    $scope.loadRankingSystems = function(){
        rankingSystemSvr.query($scope.rankingSystemSearch, function(resultModels) {
            $scope.searchInfo[0].options = resultModels;
            $scope.searchInfo[0].selected = $scope.searchInfo[0].options[0]._id;
        });
    };

    $scope.buildPeriodList();
    $scope.loadRankingSystems();

});