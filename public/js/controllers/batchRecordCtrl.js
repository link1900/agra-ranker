angular.module('controllers').controller('batchRecordCtrl', ['$scope', '$routeParams', 'headerHelperService', 'batchService',
    function($scope, $routeParams, headerHelperService, batchService) {

        $scope.loadBatchRecords = function(){
            batchService.records($scope.searchParams, $routeParams.id, function(data, status, headers){
                $scope.records = data;
                $scope.totalItems = headerHelperService.totalItemsFromHeader(headers());
            });
        };

        $scope.searchParams = {
            page : 1,
            per_page : 15,
            sort_field: 'createdAt',
            sort_direction: 'asc',
            like : ''
        };

        $scope.changePage = function(page){
            $scope.searchParams.page = page;
            $scope.loadBatchRecords();
        };
    }
]);