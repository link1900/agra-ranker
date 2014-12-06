angular.module('controllers').controller('ExportCtrl', function($scope, batchService) {

    $scope.createExportJob = function(collectionName, exportType){
        batchService.createExport(collectionName, exportType).then(function(result){
            $scope.exportCreatedId = result._id;
            $scope.exportStatus = 'success';
        }, function(failedResult){
            $scope.exportError = failedResult.data.error;
            $scope.exportStatus = 'failed';
        });
    };

    $scope.clear = function(){
        $scope.exportStatus = 'ready';
        delete $scope.exportCreatedId;
        delete $scope.exportError;
    };

    $scope.clear();
});