angular.module('services').factory('groupLevelService', ['$resource', '$http',
    function($resource){
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