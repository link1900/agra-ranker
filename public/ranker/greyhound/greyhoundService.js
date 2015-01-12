angular.module('services').factory('greyhoundService', ['$resource', '$http',
    function($resource, $http){
        var service = $resource(
            'greyhound/:greyhoundId',
            {
                greyhoundId:'@_id'
            },{
                update: {
                    method: 'PUT'
                }
            }
        );

        service.findOrCreateGreyhound = function(newGreyhound){
            return service.query(newGreyhound).$promise.then(function(results){
                if (results.length != null){
                    if (results.length > 0){
                        return results[0];
                    } else  {
                        //cannot find anything create a new one
                        return $http.post("/greyhound", newGreyhound).then(function(creationResult){
                            return creationResult.data;
                        });
                    }
                }
            });
        };

        return service;
    }
]);