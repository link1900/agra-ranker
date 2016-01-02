angular.module('services').service('eventSvr',  function($http,$resource) {
    var eventSvr = $resource(
        'event/:eventId',
        {
            eventId:'@_id'
        },{
            update: {
                method: 'PUT'
            }
        }
    );

    return eventSvr;
});