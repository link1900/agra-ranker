angular.module('controllers').controller('GroupLevelCtrl', ['$scope', '$routeParams', 'headerHelperService', 'groupLevelService',
    function($scope, $routeParams, headerHelperService, groupLevelService) {

        $scope.findOne = function() {
            groupLevelService.get({
                groupLevelId: $routeParams.id
            }, function(model) {
                $scope.loadGroupLevel(model);
            }, function(){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
                ];
            });
        };

        $scope.loadGroupLevel = function(gl){
            $scope.groupLevel = gl;
        };

        $scope.groupLevelService = groupLevelService;

        $scope.columnInfo = [
            {title: "Name", field:"name"}
        ];

        $scope.deleteModel = function(){
            $scope.groupLevel.$delete(function(data){
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