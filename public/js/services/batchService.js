angular.module('services').factory('batchService', ['$resource', '$http',
    function($resource, $http){
        var batchService = $resource(
            'batch/:batchId',
            {
                batchId:'@_id'
            },{
                update: {
                    method: 'PUT'
                }
            }
        );

        batchService.run = function(id){
            return $http.put('/batch/'+id+'/run',{});
        };

        return batchService;
    }
]);