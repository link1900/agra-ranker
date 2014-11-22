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

    userService.grantAccess = function(user){
        return $http.post("/user/grantAccess/"+ user._id).then(function(result){
            return result.data;
        });
    };

    userService.resetPassword = function(user){
        return $http.post("/user/resetPassword/"+ user._id).then(function(result){
            return result.data;
        });
    };

    userService.changePassword = function(passwordChange){
        return $http.post("/user/changePassword", passwordChange).then(function(result){
            return result.data;
        });
    };

    userService.changePasswordToken = function(token, passwordChange){
        return $http.post("/user/changePasswordToken/" + token, passwordChange).then(function(result){
            return result.data;
        });
    };

    userService.findToken = function(token){
        return $http.get("/user/token/" + token).then(function(result){
            return result.data;
        });
    };

    userService.signUp = function(user) {
        return $http.post("/user/requestAccess", user).then(function(result){
            return result.data;
        });
    };

    return userService;
});