angular.module('services').service('GreyhoundService', ['$http', function($http) {
    var greyhoundService = {};

    greyhoundService.getGreyhound = function(id){
        return $http.get('/greyhound/' + id)
            .then(function(res){
                return res.data;
            });
    };

    return greyhoundService;
}]);