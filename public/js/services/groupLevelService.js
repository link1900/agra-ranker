angular.module('services').factory('groupLevelService', ['$resource', '$http',
    function($resource, $http){
        var groupLevelService = $resource(
            'groupLevel/:groupLevelId',
            {
                groupLevelId:'@_id'
            },{
                update: {
                    method: 'PUT'
                }
            }
        );

        return groupLevelService;
    }
]);