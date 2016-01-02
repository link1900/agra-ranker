angular.module('controllers').controller('settingCtrl', function($scope, settingSvr, rankingSystemSvr) {
    $scope.settings = {settingType : "system"};
    $scope.rankingSystems = [];

    $scope.loadSystemSetting = function(settings){
        $scope.settings = settings;
    };

    $scope.findOne = function() {
        settingSvr.query({
            settingType: "system"
        }, function(settings) {
            if (settings != null && settings.length > 0){
                $scope.loadSystemSetting(settings[0]);
            }
        });
    };

    $scope.loadRankingSystems = function(){
        rankingSystemSvr.query({}, function(rankingSystems){
            $scope.rankingSystems = rankingSystems;
        });
    };

    $scope.saveSettings = function(){
        if ($scope.settings != null && $scope.settings._id != null){
            $scope.settings.$update(function(data){
                    $scope.alerts = [
                        { type: 'success', msg: "Updated " + data.name }
                    ];
                    $scope.loadRace(data);
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "update " + error.data.error }
                    ];
                });
        } else {
            settingSvr.save({}, $scope.settings, function(data){
                    $scope.alerts = [
                        { type: 'success', msg: "Created " + data.name }
                    ];
                    $scope.loadSystemSetting(data);
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "create " + error.data.error }
                    ];
                });
        }
    };

    $scope.findOne();
    $scope.loadRankingSystems();
});