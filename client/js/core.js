angular.module('core',
    ['auth0.lock', 'angular-jwt', 'ngRoute',
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

function config($httpProvider, lockProvider, jwtOptionsProvider) {
    lockProvider.init({
        clientID: 'dH125kyqeBr6M0KBt5fJckXiUAi2x7BS',
        domain: 'app23098245.auth0.com'
    });

    jwtOptionsProvider.config({
        tokenGetter: function() {
            return localStorage.getItem('id_token');
        }
    });

    $httpProvider.interceptors.push('jwtInterceptor');
}

function run(lock, authService, authManager){
    lock.interceptHash();
    authService.registerAuthenticationListener();
    authManager.checkAuthOnRefresh();
}

angular.module('controllers', []);
angular.module('services', []);
angular.module('directives', []);
angular.module('filters', []);


