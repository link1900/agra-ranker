angular.module('services').factory('greyhoundSvr', ['$resource', '$http',
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

        service.lookupExternalData = function(greyhoundId){
            return $http.get("/greyhound/" + greyhoundId + "/externalLookUp").then(function(result){
                if (result != null){
                    return result.data;
                } else {
                    return null;
                }
            });
        };

        service.findOrCreateGreyhound = function(newGreyhoundName){
            return service.query({name: newGreyhoundName}).$promise.then(function(results){
                if (results.length != null){
                    if (results.length > 0){
                        return results[0];
                    } else  {
                        //cannot find anything create a new one
                        return $http.post("/greyhound", {name: newGreyhoundName}).then(function(creationResult){
                            if (creationResult != null){
                                return creationResult.data;
                            } else {
                                return null;
                            }
                        });
                    }
                }
            });
        };

        return service;
    }
]);