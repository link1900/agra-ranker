angular.module('controllers').controller('BatchCtrl', function($scope, $routeParams, headerHelperService, batchService, rankerEventBus) {
//    socket.forward('batchInfo', $scope);
//
//    $scope.$on('socket:batchInfo', function(event, batchInfo) {
//        if (batchInfo != null){
//            $scope.batchInfo = batchInfo;
//        }
//    });
//
//    socket.emit('requestBatchInfo');

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

    $scope.getTotalDuration = function(batch){
        if (batch != null){
            batchService.getTotals(batch).then(function(result){
                batch.totalDuration = result.totalDuration;
                batch.totalSuccess = result.totalSuccess;
                batch.totalFailure = result.totalFailure;
            });
        }
    };

    $scope.loadBatch = function(batch){
        $scope.batch = batch;
        $scope.getTotalDuration($scope.batch);
    };

    $scope.batchService = batchService;

    $scope.columnInfo = [
        {title: "Status", field:"status", baseLink:"#/batch/view/", linkField: "_id", link:true},
        {title: "File Name", field:"name"},
        {title: "Batch Type", field:"type"},
        {title: "Created", field:"createdAt", filter: "fromNow"}
    ];

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

    $scope.createExportJob = function(collectionName, exportType){
        batchService.createExport(collectionName, exportType).then(function(){
            $scope.alerts = [
                { type: 'success', msg: "Created new batch job to generate the export file"}
            ];
        }, function(failedResult){
            $scope.alerts = [
                { type: 'danger', msg: "Failed create the export batch job. " + failedResult.error}
            ];
        });
    };
});