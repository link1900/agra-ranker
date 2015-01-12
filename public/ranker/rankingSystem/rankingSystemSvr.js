angular.module('services').factory('rankingSystemSvr', ['$resource', '$http',
    function($resource, $http){
        var service = $resource(
            'rankingSystem/:rankingSystemId',
            {
                rankingSystemId:'@_id'
            },{
                update: {
                    method: 'PUT'
                }
            }
        );

        return service;
    }
]);