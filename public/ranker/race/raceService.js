angular.module('services').factory('raceService', ['$resource', '$http',
    function($resource, $http){
        var service = $resource(
            'race/:raceId',
            {
                raceId:'@_id'
            },{
                update: {
                    method: 'PUT'
                }
            }
        );

        return service;
    }
]);