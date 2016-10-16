(function() {

    'use strict';

    angular
        .module('services')
        .service('authService', authService);

    authService.$inject = ['$rootScope', 'lock', 'authManager'];

    function authService($rootScope, lock, authManager) {

        var userProfile = JSON.parse(localStorage.getItem('profile'));

        function login() {
            lock.show();
        }

        // Logging out just requires removing the user's
        // id_token and profile
        function logout() {
            localStorage.removeItem('id_token');
            localStorage.removeItem('profile');
            authManager.unauthenticate();
            userProfile = {};
        }

        // Set up the logic for when a user authenticates
        // This method is called from app.run.js
        function registerAuthenticationListener() {
            if (userProfile){
                $rootScope.user = userProfile;
                $rootScope.$broadcast('userProfileSet', userProfile);
            }

            lock.on('authenticated', function(authResult) {
                localStorage.setItem('id_token', authResult.idToken);
                authManager.authenticate();
                lock.getProfile(authResult.idToken, function(error, profile) {
                    if (!error) {
                        localStorage.setItem('profile', JSON.stringify(profile));
                        $rootScope.user = profile;
                        $rootScope.$broadcast('userProfileSet', profile);
                    }
                });
            });
        }

        return {
            userProfile: userProfile,
            login: login,
            logout: logout,
            registerAuthenticationListener: registerAuthenticationListener
        }
    }
})();