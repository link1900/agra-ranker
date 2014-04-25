angular.module('controllers').controller('GreyhoundFieldCtrl', ['$scope', 'greyhoundService',
    function($scope, greyhoundService) {

        $scope.select2Options = {
            allowClear:true
        };

        $scope.searchParamsGreyhoundField = {
            page : 1,
            per_page : 15,
            like : '',
            sort_field: 'name',
            sort_direction: 'asc'
        };

        $scope.greyhoundSearch = function(val) {
            $scope.searchParamsGreyhoundField.like = val;
            return greyhoundService.query($scope.searchParamsGreyhoundField).$promise.then(function(result){
                var results = _.map(result, function(r){
                    return r.name.toUpperCase();
                });
                return results;
            });
        };
    }
]);