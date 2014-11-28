angular.module('services').service('inviteSvr',  function($http,$resource) {
    var inviteSvr = $resource(
        'invite/:inviteId',
        {
            inviteId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        }
    );
    return inviteSvr;
});
