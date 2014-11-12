angular.module('controllers').controller('FileCtrl', function($scope, $routeParams, fileService) {

    $scope.findOne = function() {
        fileService.get({
            fileId: $routeParams.id
        }, function(file) {
            $scope.file = file;
        }, function(){
            $scope.alerts = [
                { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
            ];
        });
    };

    $scope.columnInfo = [
        {title: "File Name", field:"filename", baseLink:"#/admin/file/view/", linkField: "_id", link:true},
        {title: "Uploaded Date", field:"uploadDate", filter: "date", filterFormat: 'medium'}
    ];

    $scope.fileService = fileService;
});