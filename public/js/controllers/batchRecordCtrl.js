angular.module('controllers').controller('batchRecordCtrl', function($scope, $routeParams, batchRecordService) {

        $scope.batchRecordService = batchRecordService;

        $scope.columnInfo = [
            {title: "Record Number", field:"recordNumber"},
            {title: "Status", field:"status"},
            {title: "Data Date", field:"rawData"}
        ];

        $scope.searchFields = {
            'batchRef': $routeParams.id
        };
});