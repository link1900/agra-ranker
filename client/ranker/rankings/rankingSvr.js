angular.module('services').factory('rankingSvr',
    function($resource, $http){

    var service = $resource(
        'ranking/:rankingId',
        {
            rankingId:'@_id'
        }
    );

    return service;
});