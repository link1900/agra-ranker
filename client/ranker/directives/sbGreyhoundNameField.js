angular.module('directives')
    .directive('sbGreyhoundNameField', function(headerHelperService, greyhoundSvr) {
        function linkBody(scope) {

            scope.select2Options = {
                allowClear:true
            };

            scope.greyhoundSearch = function(val) {
                var searchParams = {
                    page : 1,
                    per_page : 10,
                    sort_field: 'name',
                    sort_direction: 'asc',
                    like : val
                };

                return greyhoundSvr.query(searchParams).$promise;
            };
        }

        return {
            restrict: 'A',
            scope: {
                sbModel: '='
            },
            link: linkBody,
            templateUrl: '/ranker/directives/sbGreyhoundNameField.html'
        };
    });

