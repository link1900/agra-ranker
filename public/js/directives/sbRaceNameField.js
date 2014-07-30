angular.module('directives')
    .directive('sbRaceNameField', function(headerHelperService, raceService) {
        function linkBody(scope) {

            scope.select2Options = {
                allowClear:true
            };

            scope.searchParamsRaceField = {
                page : 1,
                per_page : 15,
                like : '',
                sort_field: 'name',
                sort_direction: 'asc'
            };

            scope.search = function(val) {
                scope.searchParamsRaceField.like = val;
                return raceService.query(scope.searchParamsRaceField).$promise.then(function(result){
                    return _.map(result, function(r){
                        return r.name.toUpperCase();
                    });
                });
            };
        }

        return {
            restrict: 'A',
            scope: {
                sbModel: '='
            },
            link: linkBody,
            templateUrl: '/views/directives/sbRaceNameField.html'
        };
    });

