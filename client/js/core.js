var core = angular.module('core',
        ['ngRoute',
         'ngResource',
         'ngSanitize',
         'ui.bootstrap',
         'angulartics',
            'angulartics.google.analytics',
         'ui.select2',
         'angularFileUpload',
         'ui.sortable',
         'angular-loading-bar',
         'btford.socket-io',
         'ui.route',
         'filter.duration',
         'LocalStorageModule',
         'mgcrea.ngStrap',
         'controllers',
         'services',
         'directives',
         'filters',
            'ui.select']);

angular.module('controllers', []);
angular.module('services', []);
angular.module('directives', []);
angular.module('filters', []);

core.factory('socket', function coreSetup(socketFactory) {
    return socketFactory();
});
