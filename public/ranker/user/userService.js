angular.module('services').service('userService',  function($http,$resource) {
    var userService = $resource(
        'user/:userId',
        {
            userId:'@_id'
        },{
            update: {
                method: 'PUT'
            }
        }
    );

    userService.signUp = function(user) {
        return $http.post("/user/requestAccess", user).then(function(result){
            return result.data;
        });
    };

    return userService;
});