angular.module('directives')
    .directive('sbDateRange', function() {
        function linkBody(scope) {

            scope.fromYear = scope.fromYear ? scope.fromYear : 2012;
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

            scope.monthList = function(){
                var currentMonth = moment().startOf('year');
                var months = [];
                for (var i=1;i<13;i++){
                    months.push({name: currentMonth.format("MMMM"), value:currentMonth.clone()});
                    currentMonth = currentMonth.add(1, 'months');
                }
                return months;
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
                scope.setModelStartDate(start);
                scope.setModelEndDate(end);
            };

            scope.setModelStartDate = function(start){
                if (start != null){
                    scope.sbModel.startDate = moment(start).toDate();
                } else {
                    scope.sbModel.startDate = null;
                }

            };

            scope.setModelEndDate = function(end){
                if (end != null){
                    scope.sbModel.endDate = moment(end).toDate();
                } else {
                    scope.sbModel.endDate = null;
                }
            };

            scope.setToAllTime = function(){
                scope.setModelDateFromRange({start: null, end:null});
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

            scope.setMonth = function(date){
                scope.setModelDate(date.startOf('month').toDate(), date.endOf('month').toDate());
            };

            scope.setYear = function(year){
                scope.setModelDateFromRange(scope.getYearDates(year));
            };

            scope.setRankerYear = function(rankerYear){
                scope.setModelDateFromRange(scope.getRankingYearDates(rankerYear));
            };

            scope.monthOptions = scope.monthList();
            scope.yearOptions = scope.yearList();
            scope.rankingYearOptions = scope.rankingYearList();


            if (scope.defaultStartDate != null){
                scope.setModelStartDate(scope.defaultStartDate);
            }

            if (scope.defaultEndDate != null){
                scope.setModelEndDate(scope.defaultEndDate);
            }
        }

        return {
            restrict: 'A',
            scope: {
                fromYear:'@',
                defaultStartDate: '=',
                defaultEndDate: '=',
                sbModel:'='
            },
            link: linkBody,
            templateUrl: '/ranker/directives/sbDateRangeTemplate.html'
        };
    });

