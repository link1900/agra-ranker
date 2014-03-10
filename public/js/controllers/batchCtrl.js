angular.module('controllers').controller('BatchCtrl', ['$scope', '$routeParams', 'headerHelperService', 'batchService', 'rankerEventBus',
    function($scope, $routeParams, headerHelperService, batchService, rankerEventBus) {

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

        $scope.$on(rankerEventBus.EVENTS.ENTITY_BATCH_CREATED,function() {
            $scope.loadBatches();
        });

        $scope.cancelBatch = function(){
            $scope.batch.status = 'Cancelled';
            $scope.batch.$update(function(data){
                    $scope.alerts = [
                        { type: 'success', msg: "Canceled batch" }
                    ];
                    $scope.loadBatch(data);
                    rankerEventBus.broadcastEvent(rankerEventBus.EVENTS.ENTITY_BATCH_UPDATED, data);
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "Failed to update: " + error.data }
                    ];
                }
            );
        };

        $scope.runBatch = function(){
            batchService.run($scope.batch._id).then(function(){
                    $scope.alerts = [
                        { type: 'success', msg: "Started batch" }
                    ];
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "Failed to start batch: " + error.data }
                    ];
                }
            );
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

        $scope.deleteBatch = function(){
            $scope.batch.$delete(function(data){
                    delete $scope.batch;
                    $scope.alerts = [
                        { type: 'success', msg: "Deleted " + data.name.toUpperCase() }
                    ];
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "Failed to delete: " + error.data }
                    ];
                }
            );
        };
    }
]);