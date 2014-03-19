angular.module('services').factory('greyhoundService', ['$resource', '$http',
    function($resource, $http){
        return $resource(
            'greyhound/:greyhoundId',
            {
                greyhoundId:'@_id'
            },{
                update: {
                    method: 'PUT'
                }
            }
        );
    }
]);