angular.module('services').factory('batchService',
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

        batchService.getTotals = function(batch){
            return $http.get("/batch/"+batch._id+"/totals").then(function(result){
                return result.data;
            });
        };


        return batchService;
    }
);