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

        service.getPresets = function(){
            return $http.get('/rankingSystemPreset');
        };

        return service;
    }
]);