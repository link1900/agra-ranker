angular.module('directives')
    .directive('sbRaceNameField', function(headerHelperService, raceSvr) {
        function linkBody(scope) {

            scope.select2Options = {
                allowClear:true
            };

            scope.raceSearch = function(val) {
                var searchParams = {
                    page : 1,
                    per_page : 20,
                    sort_field: 'name',
                    sort_direction: 'asc',
                    like : val
                };

                return raceSvr.query(searchParams).$promise.then(function(results){
                    return _.unique(results, 'name');
                });
            };
        }

        return {
            restrict: 'A',
            scope: {
                sbModel: '='
            },
            link: linkBody,
            templateUrl: '/ranker/directives/sbRaceNameField.html'
        };
    });

