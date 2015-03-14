angular.module('controllers').controller('GroupLevelCtrl', ['$scope', '$routeParams', 'headerHelperService', 'groupLevelService', '$location',
    function($scope, $routeParams, headerHelperService, groupLevelService, $location) {

        $scope.findOne = function() {
            groupLevelService.get({
                groupLevelId: $routeParams.id
            }, function(model) {
                $scope.load(model);
            }, function(){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
                ];
            });
        };

        $scope.load = function(gl){
            $scope.groupLevel = gl;
        };

        $scope.groupLevelService = groupLevelService;

        $scope.columnInfo = [
            {title: "Name", field:"name", type:"link", baseLink:"#/groupLevel/view/", linkField: "_id"},
            {title: "Last updated", field:"updatedAt", filter: "fromNow"}
        ];

        $scope.create = function(){
            groupLevelService.save({}, $scope.groupLevel, function(response){
                $location.path('groupLevel/view/'+ response._id);
            },
            function(error){
                $scope.alerts = [
                    { type: 'danger', msg: "create " + error.data.error }
                ];
            });
        };

        $scope.isInvalid = function(formField){
            return formField.$dirty && formField.$invalid;
        };

        $scope.isValid =  function(formField){
            return formField.$dirty && !formField.$invalid && !$scope.hasServerErrors();
        };

        $scope.hasServerErrors = function(){
            return _.where($scope.alerts, { 'type': 'danger' }).length > 0;
        };

        $scope.save = function(){
            $scope.groupLevel.$update(function(data){
                    $scope.alerts = [
                        { type: 'success', msg: "Updated " + data.name }
                    ];
                    $scope.load(data);
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "update " + error.data.error }
                    ];
                });
        };

        $scope.deleteGroupLevel = function(){
            $scope.groupLevel.$delete(function(data){
                    delete $scope.batch;
                    $scope.alerts = [
                        { type: 'success', msg: "Deleted " + data.name.toUpperCase() }
                    ];
                    $location.path('/groupLevel');
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "delete " + error.data }
                    ];
                }
            );
        };
    }
]);