angular.module('services').factory('batchRecordService',function($resource){
    return $resource('batchRecord');
});