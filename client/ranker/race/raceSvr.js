angular.module('services').factory('raceSvr', ['$resource', '$http',
    function($resource){
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