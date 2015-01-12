angular.module('services').service('generalService',  function($http) {
    var generalService = {};

    generalService.getDistances = function(){
        return $http.get("/distance").then(function(result){
            return result.data;
        });
    };

    return generalService;
});