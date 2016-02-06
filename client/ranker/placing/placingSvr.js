angular.module('services').factory('placingSvr', ['$resource', '$http',
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

        service.deletePlacing = function(placing){
            return $http.delete("/placing/"+placing._id).then(function(result){
                return result.data;
            });
        };

        return service;
    }
]);