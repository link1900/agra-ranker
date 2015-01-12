angular.module('services').factory('rankingSvr',
    function($resource, $http){

    var service = $resource(
        'ranking/:rankingId',
        {
            rankingId:'@_id'
        }
    );

    service.createForRankingSystem = function(rankingSystemRef){
        return $http.post('/ranking?rankingSystemRef=' +rankingSystemRef);
    };

    return service;
});