angular.module('services').service('userService',  function($http) {
    var userService = {};

    userService.signUp = function(user) {
        return $http.post("/user", user).then(function(result){
            return result.data;
        });
    };

    return userService;
});