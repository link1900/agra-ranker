angular.module('services').factory('batchResultService',function($resource){
    return $resource(
        'batchResult/:batchResultId',
        {
            batchResultId:'@_id'
        }
    );
});