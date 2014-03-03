angular.module('services').factory('greyhoundService', ['$resource', '$http',
    function($resource, $http){
        var greyhoundService = $resource(
            'greyhound/:greyhoundId',
            {
                greyhoundId:'@_id'
            },{
                update: {
                    method: 'PUT'
                }
            }
        );

        greyhoundService.offspring = function(id, callback){
            return $http.get('/greyhound/'+id+'/offspring').success(function(data) {
                callback(data);
            }).
            error(function(data, status, headers) {
                callback([]);
            });
        };

        return greyhoundService;
    }
]);