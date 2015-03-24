angular.module('directives')
    .directive('sbGreyhoundNameField', function(headerHelperService, greyhoundSvr) {
        function linkBody(scope) {

            scope.select2Options = {
                allowClear:true
            };

            scope.searchParamsGreyhoundField = {
                page : 1,
                per_page : 15,
                like : '',
                sort_field: 'name',
                sort_direction: 'asc'
            };

            scope.greyhoundSearch = function(val) {
                scope.searchParamsGreyhoundField.like = val;
                return greyhoundSvr.query(scope.searchParamsGreyhoundField).$promise.then(function(result){
                    return _.map(result, function(r){
                        return r.name;
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
            templateUrl: '/ranker/directives/sbGreyhoundNameField.html'
        };
    });

