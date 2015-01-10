angular.module('services').factory('rankingSvr',
    function($resource){

    return $resource(
        'ranking/:rankingId',
        {
            rankingId:'@_id'
        }
    );
});