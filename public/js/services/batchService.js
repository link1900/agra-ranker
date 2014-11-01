angular.module('services').factory('batchService', ['$resource',
    function($resource){
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

        return batchService;
    }
]);