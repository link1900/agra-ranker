angular.module('services').service('securityService',  function($http) {
    var securityService = {};

    securityService.getCurrentUser = function(){
        return $http.get("/me").then(function(result){
            return result.data;
        });
    };

    securityService.signIn = function(login) {
        return $http.post("/login", login).then(function(result){
            return result.data;
        });
    };

    securityService.signOut = function() {
        return $http.post("/logout", {});
    };

    return securityService;
});