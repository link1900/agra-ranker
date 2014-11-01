angular.module('services').factory('batchResultService',function($resource){
    return $resource('batchResult');
});