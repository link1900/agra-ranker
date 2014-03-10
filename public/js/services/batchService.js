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

        batchService.records = function(param, id, callback){
            return $http.get('/batch/'+id+'/record', {params: param}).success(function(data, status, headers) {
                callback(data, status, headers);
            }).
                error(function() {
                    callback([]);
                });
        };

        batchService.run = function(id){
            return $http.put('/batch/'+id+'/run',{});
        };

        return batchService;
    }
]);