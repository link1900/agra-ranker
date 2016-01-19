angular.module('services').factory('rankingSvr',
    function($resource){

    var service = $resource(
        'ranking/:rankingId',
        {
            rankingId:'@_id'
        }
    );

    return service;
});