/* eslint-disable no-undef,no-console */
angular.module('core',
    ['auth0.auth0', 'angular-jwt', 'ngRoute',
        'ngResource',
        'ngSanitize',
        'ui.bootstrap',
        'angulartics',
        'angulartics.google.analytics',
        'ui.select2',
        'ui.sortable',
        'angular-loading-bar',
        'ui.route',
        'filter.duration',
        'LocalStorageModule',
        'mgcrea.ngStrap',
        'controllers',
        'services',
        'directives',
        'filters',
        'ui.select']).config(config).run(run);

function config($httpProvider, $locationProvider, angularAuth0Provider, jwtOptionsProvider) {
    angularAuth0Provider.init({
        clientID: envConfig.AUTH0_CLIENT_ID,
        domain: envConfig.AUTH0_DOMAIN,
        audience: envConfig.AUTH0_AUDIENCE,
        redirectUri: envConfig.AUTH0_CALLBACK_URL,
        responseType: 'token id_token',
        scope: 'openid'
    });

    jwtOptionsProvider.config({
        tokenGetter: function() {
            return localStorage.getItem('id_token');
        }
    });

    $httpProvider.interceptors.push('jwtInterceptor');
}

function checkSession($rootScope) {
    var existingToken = localStorage.getItem('id_token');
    var expiresAt = localStorage.getItem('expires_at');
    if (existingToken && expiresAt > new Date().getTime()) {
        $rootScope.user = true;
    }
}

function interceptHash($rootScope, $location) {
    if (typeof auth0.WebAuth !== 'function') {
        throw new Error('Auth0.js version 8 or higher must be loaded');
    }

    $rootScope.$on('$locationChangeStart', function(event, location) {
        if (
            /id_token=/.test(location) ||
            /access_token=/.test(location) ||
            /error=/.test(location)
        ) {
            var webAuth = new auth0.WebAuth({
                clientID: envConfig.AUTH0_CLIENT_ID,
                domain: envConfig.AUTH0_DOMAIN
            });

            var hash = $location.hash() || window.location.hash;

            webAuth.parseHash(
                { hash: hash, _idTokenVerification: true },
                function(err, authResult) {
                    if (err) {
                        console.log(err);
                    }
                    if (authResult && authResult.idToken) {
                        let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
                        localStorage.setItem('access_token', authResult.accessToken);
                        localStorage.setItem('id_token', authResult.idToken);
                        localStorage.setItem('expires_at', expiresAt);
                        $rootScope.user = true;
                    }
                }
            );
        }
    });
}

function run($rootScope, $location, angularAuth0) {
    checkSession($rootScope);
    interceptHash($rootScope, $location, angularAuth0);
}

angular.module('controllers', []);
angular.module('services', []);
angular.module('directives', []);
angular.module('filters', []);


