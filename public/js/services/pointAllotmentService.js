angular.module('services').factory('pointAllotmentService',
function($http, $resource){
    var service = $resource(
        'pointAllotment/:pointAllotmentId',
        {
            pointAllotmentId:'@_id'
        },{
            update: {
                method: 'PUT'
            }
        }
    );

    service.create = function(rankingSystemId){
        return $http.post('/pointAllotment?rankingSystemRef='+rankingSystemId, {});
    };

    return service;
});