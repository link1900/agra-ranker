angular.module('services').factory('rankingSystemService', ['$resource', '$http',
    function($resource, $http){
        var service = $resource(
            'rankingSystem/:rankingSystemId',
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