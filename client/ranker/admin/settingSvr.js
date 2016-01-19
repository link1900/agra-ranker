angular.module('services').factory('settingSvr',
    function($resource){

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