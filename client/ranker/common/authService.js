(function() {

    'use strict';

    angular
        .module('services')
        .service('authService', authService);

    authService.$inject = ['$rootScope', 'angularAuth0'];

    function authService($rootScope, angularAuth0) {


        function login() {
            angularAuth0.authorize();
        }

        function logout() {
            localStorage.removeItem('id_token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('expires_at');
            $rootScope.user = undefined;
        }


        return {
            login: login,
            logout: logout
        }
    }
})();
