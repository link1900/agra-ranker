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

        service.savePlacing = function(placing) {
            if (placing._id == null){
                return $http.post("/placing", placing).then(function(result){
                    return result.data;
                });
            } else {
                return $http.put("/placing/"+placing._id, placing).then(function(result){
                    return result.data;
                });
            }

        };

        return service;
    }
]);