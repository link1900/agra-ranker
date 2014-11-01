angular.module('controllers').controller('batchResultCtrl', function($scope, $routeParams, batchResultService) {

        $scope.batchResultService = batchResultService;

        $scope.columnInfo = [
            {title: "Record Number", field:"recordNumber"},
            {title: "Status", field:"status"}
        ];

        $scope.searchFields = {
            'batchRef': $routeParams.id
        };
});