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

    inviteSvr.deleteAllExpired = function(){
        return $http.delete("/invite/expired").then(function(result){
            return result.data;
        });
    };

    return inviteSvr;
});
