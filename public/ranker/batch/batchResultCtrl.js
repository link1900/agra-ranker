angular.module('controllers').controller('batchResultCtrl', function($scope, $routeParams, batchResultService) {

    $scope.batchResultService = batchResultService;

    $scope.findOne = function() {
        batchResultService.get({
            batchResultId: $routeParams.id
        }, function(batchResult) {
            $scope.loadBatchResult(batchResult);
        }, function(){
            $scope.alerts = [
                { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
            ];
        });
    };

    $scope.loadBatchResult = function(batchResult){
        if (batchResult.endDate != null && batchResult.startDate != null){
            batchResult.processingDuration = new Date(batchResult.endDate).getTime() - new Date(batchResult.startDate).getTime();
        }
        $scope.batchResult = batchResult;
    };

    $scope.columnInfo = [
        {title: "Record Number", field:"recordNumber"},
        {title: "Record", field:"raw"},
        {title: "Status", field:"status", type:"link", baseLink:"#/batchResult/view/", linkField: "_id"}
    ];

    $scope.searchFields = {
        'batchRef': $routeParams.id
    };
});