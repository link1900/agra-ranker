angular.module('services').factory('greyhoundService', ['$resource',
    function($resource){
        return $resource(
            'greyhound/:greyhoundId', {
                greyhoundId:'@_id'
            },{
                update: {
                    method: 'PUT'
                }
            });
    }]);

//angular.module('services').service('greyhoundService', ['$http','rankerEventBus', function($http,rankerEventBus) {
//    var greyhoundService = {};
//
//    greyhoundService.get = function(id){
//        if (id){
//            $http.get('/greyhound/' + id)
//            .success(function(data) {
//                return data;
//            }).
//            error(function(data, status, headers) {
//                var errorInfo = {"data": data, "status": status, "headers": headers};
//                rankerEventBus.broadcastEvent(rankerEventBus.EVENTS.ON_ERROR, errorInfo);
//                return null;
//            });
//        } else {
//            return null;
//        }
//    };
//
//    greyhoundService.getList = function(queryParams){
//        return $http.get('/greyhound', {
//            params: queryParams
//        })
//        .success(function(data) {
//            return data;
//        }).
//        error(function(data, status, headers) {
//            var errorInfo = {"data": data, "status": status, "headers": headers};
//            rankerEventBus.broadcastEvent(rankerEventBus.EVENTS.ON_ERROR, errorInfo);
//            return [];
//        });
//    };
//
//    return greyhoundService;
//}]);