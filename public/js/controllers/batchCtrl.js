angular.module('controllers').controller('BatchCtrl', ['$scope', '$routeParams', 'headerHelperService', 'batchService', '$location',
    function($scope, $routeParams, headerHelperService, batchService, $location) {

        $scope.findOne = function() {
            batchService.get({
                batchId: $routeParams.id
            }, function(batch) {
                $scope.loadBatch(batch);
            }, function(){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
                ];
            });
        };

        $scope.loadBatchRecords = function(batch){
            //todo
        };

        $scope.loadBatch = function(batch){
            $scope.batch = batch;
        };

        $scope.searchParams = {
            page : 1,
            per_page : 15,
            sort_field: 'createdAt',
            sort_direction: 'desc',
            like : ''
        };

        $scope.changePage = function(page){
            $scope.searchParams.page = page;
            $scope.loadBatches();
        };

        $scope.loadBatches = function() {
            batchService.query($scope.searchParams, function(batches, headers) {
                $scope.batches = batches;
                $scope.totalItems = headerHelperService.totalItemsFromHeader(headers());
            });
        };
    }
]);