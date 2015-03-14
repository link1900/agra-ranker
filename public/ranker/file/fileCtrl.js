angular.module('controllers').controller('FileCtrl', function($scope, $routeParams, fileService, $http) {

    $scope.findOne = function() {
        fileService.get({
            fileId: $routeParams.id
        }, function(file) {
            $scope.file = file;
            $scope.file.downloadUrl = '/file/'+ $routeParams.id + "/download";
        }, function(){
            $scope.alerts = [
                { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
            ];
        });
    };

    $scope.columnInfo = [
        {title: "File Name", field:"filename", type:"link", baseLink:"#/file/view/", linkField: "_id"},
        {title: "Size", field:"length", filter: "bytes"},
        {title: "Uploaded", field:"uploadDate", filter: "fromNow"}
    ];

    $scope.fileService = fileService;

    $scope.deleteFile = function(){
        $scope.file.$delete(function(){
                delete $scope.file;
                $scope.alerts = [
                    { type: 'success', msg: "Deleted file" }
                ];
                $location.path('/file');
            },
            function(error){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed to delete: " + error.data }
                ];
            }
        );
    };
});