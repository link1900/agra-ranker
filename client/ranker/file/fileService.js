angular.module('services').factory('fileService',
    function($resource){
        var fileService = $resource(
            'file/:fileId',
            {
                fileId:'@_id'
            },{
                update: {
                    method: 'PUT'
                }
            }
        );

        return fileService;
    }
);