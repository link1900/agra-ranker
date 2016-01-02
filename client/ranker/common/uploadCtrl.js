angular.module('controllers').controller('UploadCtrl', ['$scope', '$upload', 'rankerEventBus',
    function($scope, $upload,rankerEventBus) {

        $scope.openFileSelect = function(type){
            if (type == 'greyhound'){
                $scope.uploadUrl = 'file/batch?batchType=importGreyhoundCSV';
            }
            if (type == 'race'){
                $scope.uploadUrl = 'file/batch?batchType=importRaceCSV';
            }
            $('#hiddenFileOpen').click();
        };

        $scope.onFileSelect = function($files) {
            if ($files.length == 1){
                $scope.isUploading = true;
                $scope.uploadingFile = $files[0];
                $upload.upload({
                    url: $scope.uploadUrl,
                    method: 'POST',
                    headers: {'uploadFilename': $scope.uploadingFile.name},
                    // withCredentials: true,
                    file: $scope.uploadingFile
                })
                .success(function(data, status, headers, config) {
                    $scope.isUploading = false;
                    $scope.uploadResult = data;
                    rankerEventBus.broadcastEvent(rankerEventBus.EVENTS.ENTITY_BATCH_CREATED, data);

                })
                .error(function(data, status, headers, config) {
                    $scope.isUploading = false;
                    $scope.errorResult = data;
                });
            }
        };

        $scope.clearSelectedFiles = function(){
            delete $scope.uploadingFile;
            delete $scope.uploadResult;
            delete $scope.errorResult;
        };
    }]);