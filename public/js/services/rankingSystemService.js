angular.module('services').factory('rankingSystemService', ['$resource', '$http',
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