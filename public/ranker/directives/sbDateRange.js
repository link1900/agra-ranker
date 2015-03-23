angular.module('directives')
    .directive('sbDateRange', function() {
        function linkBody(scope) {

            scope.fromYear = scope.fromYear ? scope.fromYear : 2010;
            scope.showDateRangeDetails = false;
            scope.showRankingYearHelp = false;

            scope.getRankingYearDates = function(year){
                var midYear = moment().set('year', year).set('month', 'July').set('date', 1).startOf('day');
                return { start: midYear.toDate(), end : midYear.clone().add(12, 'months').subtract(1, 'days').endOf('day').toDate()};
            };

            scope.getRankingYearDateFromDate = function(date){
                var midYear = moment(date).set('month', 'July').set('date', 1).startOf('day');
                if (midYear.isAfter(date)){
                    return { start: midYear.clone().subtract(12, 'months').toDate(), end : midYear.subtract(1, 'days').endOf('day').toDate()};
                } else {
                    return { start: midYear.toDate(), end : midYear.clone().add(12, 'months').subtract(1, 'days').endOf('day').toDate()};
                }
            };

            scope.exampleDates = {
                now : new Date(),
                start : scope.getRankingYearDateFromDate(new Date()).start,
                end : scope.getRankingYearDateFromDate(new Date()).end
            };

            scope.getYearDates = function(year){
                var startYear = moment().set('year',year).set('month', 'Jan').set('date', 1).startOf('day');
                var endYear = moment().set('year',year).set('month', 'Dec').set('date', 31).endOf('day');
                return {start: startYear.toDate(), end: endYear.toDate()};
            };

            scope.yearList = function(){
                var startYear = scope.fromYear;
                var endYear = new Date().getFullYear();
                var years = [];
                for (var i=endYear; i>=startYear;i--){
                    years.push({name:i+"",value:i});
                }
                return years;
            };

            scope.rankingYearList = function(){
                var startYear = scope.fromYear;
                var endYear = new Date().getFullYear();
                var years = [];
                for (var i=endYear; i>=startYear;i--){
                    years.push({name: i+"-"+(i+1), value: i});
                }
                return years;
            };

            scope.setModelDateFromRange = function(range){
                scope.setModelDate(range.start, range.end);
            };

            scope.setModelDate = function(start, end){
                scope.sbModel.startDate = moment(start).toDate();
                scope.sbModel.endDate = moment(end).toDate();
            };

            scope.setToThisYear = function(){
                scope.setModelDateFromRange(scope.getYearDates(new Date().getFullYear()));
            };

            scope.setToLastYear = function(){
                scope.setModelDateFromRange(scope.getYearDates(new Date().getFullYear()-1));
            };

            scope.setToThisRankingYear = function(){
                scope.setModelDateFromRange(scope.getRankingYearDateFromDate(new Date()));
            };

            scope.setToLastRankingYear = function(){
                scope.setModelDateFromRange(scope.getRankingYearDateFromDate(moment().subtract(1, 'years').toDate()));
            };

            scope.setToThisMonth = function(){
                scope.setModelDate(moment().startOf('month').toDate(), moment().endOf('month').toDate());
            };

            scope.setToLastMonth = function(){
                scope.setModelDate(moment().subtract(1, 'month').startOf('month').toDate(), moment().subtract(1, 'month').endOf('month').toDate());
            };

            scope.setYear = function(year){
                scope.setModelDateFromRange(scope.getYearDates(year));
            };

            scope.setRankerYear = function(rankerYear){
                scope.setModelDateFromRange(scope.getRankingYearDates(rankerYear));
            };

            scope.yearOptions = scope.yearList();
            scope.rankingYearOptions = scope.rankingYearList();

            if (scope.sbModel == null || scope.sbModel.startDate == null){
                scope.setModelDateFromRange(scope.getYearDates(new Date().getFullYear()));
            }

            if (typeof scope.sbModel.startDate !== 'date'){
                scope.setModelDate(scope.sbModel.startDate, scope.sbModel.endDate);
            }
        }

        return {
            restrict: 'A',
            scope: {
                fromYear:'@',
                sbModel:'='
            },
            link: linkBody,
            templateUrl: '/ranker/directives/sbDateRangeTemplate.html'
        };
    });

