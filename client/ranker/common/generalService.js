angular.module('services').service('generalService',  function($http) {
    var generalService = {};

    generalService.getDistances = function(){
        return $http.get("/distance").then(function(result){
            return result.data;
        });
    };

    generalService.getYearArray = function(fromYear){
        var endYear = new Date().getFullYear();
        var years = [];
        for (var i=endYear; i>=fromYear;i--){
            years.push({name:i+"",value:i});
        }
        return years;
    };

    generalService.getYearDates = function(year){
        var startYear = moment().set('year',year).set('month', 'Jan').set('date', 1).startOf('day');
        var endYear = moment().set('year',year).set('month', 'Dec').set('date', 31).endOf('day');
        return {start: startYear.toDate(), end: endYear.toDate()};
    };

    return generalService;
});