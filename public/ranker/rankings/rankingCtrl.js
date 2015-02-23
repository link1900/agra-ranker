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

    $scope.searchFields = {
        'rankingSystemRef': $scope.selected.rankingSystemRef
    };

    $

    $scope.buildPeriodList = function(){
        var startYear = 2010;
        var endYear = new Date().getFullYear();
        $scope.periods = $scope.generateYearPeriods(startYear, endYear);
        if ($scope.periods.length > 0){
            $scope.selected.period = $scope.periods[0].period;
        }
    };

    $scope.generateYearPeriods = function(startYear, inclusiveEndYear){
        var periods = [];
        for (var i=inclusiveEndYear; i>=startYear;i--){
            periods.push({name: i+"", period: $scope.getYearDates(i)});
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
            $scope.rankingSystems = resultModels;
            $scope.selected.rankingSystemRef = $scope.rankingSystems[0]._id;
        });
    };
    $scope.buildPeriodList();
    $scope.loadRankingSystems();

});