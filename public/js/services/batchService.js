angular.module('services').factory('batchService', ['$resource',
    function($resource){
        return $resource(
            'batch/:batchId',
            {
                batchId:'@_id'
            },{
                update: {
                    method: 'PUT'
                }
            }
        );
    }
]);