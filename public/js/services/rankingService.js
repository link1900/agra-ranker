angular.module('services').factory('rankingService',
    function($http, $resource){
        var service = $resource(
            'ranking/:rankingId',
            {
                rankingId:'@_id'
            },{
                update: {
                    method: 'PUT'
                }
            }
        );

        service.get = function(rankingSystemId){
            return $http.post('/ranking?rankingSystemRef='+rankingSystemId, {});
        };

        service.createAll = function(){
            return $http.post('/ranking',{});
        };

        return service;
    });