angular.module('controllers').controller('UploadCtrl', ['$scope', '$upload', 'rankerEventBus',
    function($scope, $upload,rankerEventBus) {

        $scope.onFileSelect = function($files) {
            if ($files.length == 1){
                $scope.uploadingFile = $files[0];

                $upload.upload({
                    url: 'upload/batch', //upload.php script, node.js route, or servlet url
                    // method: POST or PUT,
                    // headers: {'headerKey': 'headerValue'},
                    // withCredentials: true,
                    file: $scope.uploadingFile
                })
                .success(function(data, status, headers, config) {
                    // file is uploaded successfully
                    $scope.uploadResult = data;
                    rankerEventBus.broadcastEvent(rankerEventBus.EVENTS.ENTITY_BATCH_CREATED, data);
                })
                .error(function(data, status, headers, config) {
                    // file is uploaded successfully
                    $scope.uploadResult = data;
                });
            }
        };

        $scope.clearSelectedFiles = function(){
            delete $scope.uploadingFile;
            delete $scope.uploadResult;
        };
    }]);