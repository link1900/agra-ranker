angular.module('services').factory('placingService', ['$resource', '$http',
    function($resource, $http){
        var service = $resource(
            'placing/:placingId',
            {
                placingId:'@_id'
            },{
                update: {
                    method: 'PUT'
                }
            }
        );

        return service;
    }
]);