angular.module('controllers').controller('footerCtrl', ['$scope',
    function($scope) {
        $scope.year = moment().format('YYYY');
    }
]);