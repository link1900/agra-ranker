angular.module('services').factory('settingSvr',
    function($resource, $http){

        var service = $resource(
            'setting/:settingId',
            {
                settingId:'@_id'
            },{
                update: {
                    method: 'PUT'
                }
            }
        );

    return service;
});