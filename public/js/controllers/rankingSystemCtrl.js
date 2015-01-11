angular.module('controllers').controller('RankingSystemCtrl',
    function($scope, $routeParams, headerHelperService, rankingSystemService, $location, rankingSvr) {

        $scope.findOne = function() {
            rankingSystemService.get({
                rankingSystemId: $routeParams.id
            }, function(model) {
                $scope.loadRankingSystem(model);
            }, function(){
                $scope.alerts = [
                    { type: 'danger', msg: "Failed load using the id " + $routeParams.id }
                ];
            });
        };

        $scope.positionResolutions = [
            {name: "Split Points", value:"splitPoints"},
            {name: "Same Points", value:"samePoints"}
        ];

        $scope.resolutionLabelForValue = function(value){
            var found = _.find($scope.positionResolutions, function(i){
                return i.value == value;
            });

            if (found){
                return found.name;
            } else {
                return "Split Points";
            }
        };

        $scope.loadRankingSystem = function(model){
            $scope.rankingSystem = model;
            $scope.postProcess($scope.rankingSystem);
        };

        $scope.openFileSelect = function(){
            $('#hiddenFileOpen').click();
        };

        $scope.onFileSelect = function($files){
            if ($files.length == 1) {
                var r = new FileReader();
                var f = $files[0];
                r.onload = (function (f) {
                    return function (e) {
                        try{
                            $scope.importPointDefinitions(JSON.parse(e.target.result));
                        } catch(exception){
                            $scope.alerts = [
                                { type: 'danger', msg: "Error importing point definitions" }
                            ];
                        }
                    };
                })(f);
                r.readAsText(f);
            }
        };

        $scope.importPointDefinitions = function(definitions){
            if (definitions != null &&
                definitions.length != null &&
                definitions.length > 0 &&
                definitions.length < 1000){
                definitions.forEach(function(definition){
                    var definitionToAdd = {};
                    if (definition.points != null){
                        definitionToAdd.points = definition.points;
                    }

                    if (definition.series != null){
                        definitionToAdd.series = definition.series;
                    }

                    if (definition.series != null){
                        definitionToAdd.series = definition.series;
                    }

                    if(definition.criteria != null && definition.criteria.length != null && definition.criteria.length > 0){
                        definitionToAdd.criteria = [];
                        for(var i = 0; i<definition.criteria.length;i++){
                            var criteria = definition.criteria[i];
                            var criteriaToAdd = {};
                            if(criteria.type != null){
                                criteriaToAdd.type = criteria.type;
                            }

                            if(criteria.field != null){
                                criteriaToAdd.field = criteria.field;
                            }

                            if(criteria.comparator != null){
                                criteriaToAdd.comparator = criteria.comparator;
                            }

                            if(criteria.value != null){
                                criteriaToAdd.value = criteria.value;
                            }

                            definitionToAdd.criteria.push(criteriaToAdd);
                        }
                    }

                    if (!$scope.rankingSystem){
                        $scope.rankingSystem = {};
                    }

                    if (!$scope.rankingSystem.pointAllotments){
                        $scope.rankingSystem.pointAllotments = [];
                    }

                    $scope.rankingSystem.pointAllotments.push(definitionToAdd);
                    $scope.$apply();
                });
            } else {
                $scope.alerts = [
                    { type: 'danger', msg: "Error importing point definitions" }
                ];
            }
        };

        $scope.addPointDefinition = function(){
            if (!$scope.rankingSystem){
                $scope.rankingSystem = {};
            }

            if (!$scope.rankingSystem.pointAllotments){
                $scope.rankingSystem.pointAllotments = [];
            }

            $scope.rankingSystem.pointAllotments.push({});
            $scope.setPointAllotmentEditor($scope.rankingSystem.pointAllotments.length-1);
        };

        $scope.clearPointAllotmentEditor = function(){
            $scope.currentPointAllotmentPosition = null;
            $scope.save();
        };

        $scope.removePointAllotment = function(index){
            if ($scope.rankingSystem.pointAllotments && $scope.rankingSystem.pointAllotments.length > 0){
                $scope.rankingSystem.pointAllotments.splice(index,1);
                $scope.clearPointAllotmentEditor();
            }
        };

        $scope.setPointAllotmentEditor = function(index){
            $scope.currentPointAllotmentPosition = index;
        };

        $scope.addCriteria = function(pointAllotmentIndex){
            if ($scope.rankingSystem != null &&
                $scope.rankingSystem.pointAllotments != null &&
                $scope.rankingSystem.pointAllotments[pointAllotmentIndex] != null){
                var pointAllotment = $scope.rankingSystem.pointAllotments[pointAllotmentIndex];
                if (pointAllotment.criteria == null){
                    pointAllotment.criteria = [];
                }
                pointAllotment.criteria.push({type:"text"});
            }
        };

        $scope.removeCriteria = function(pointAllotmentIndex, criteriaIndex){
            if ($scope.rankingSystem != null &&
                $scope.rankingSystem.pointAllotments != null &&
                $scope.rankingSystem.pointAllotments[pointAllotmentIndex] != null &&
                $scope.rankingSystem.pointAllotments[pointAllotmentIndex].criteria.length > 0){
                $scope.rankingSystem.pointAllotments[pointAllotmentIndex].criteria.splice(criteriaIndex,1);
            }
        };

        $scope.criteriaCompare = [
            {name: "Equals", value:"="},
            {name: "Greater then", value:">"},
            {name: "Less then", value:"<"},
            {name: "Less then or equal to", value:"<="},
            {name: "Greater then or equal to", value:">="}
        ];

        $scope.criteriaTypes = [
            {name: "Text", value:"Text"},
            {name: "Number", value:"Number"},
            {name: "Date", value:"Date"},
            {name: "Boolean", value:"Boolean"}
        ];

        $scope.recalculateRankings = function(){
            //rankingService.createAll().then(function(response){
            //    console.log(response);
            //    $scope.alerts = [
            //        { type: 'success', msg: "Recalculation complete."}
            //    ];
            //}, function(error){
            //    $scope.alerts = [
            //        { type: 'danger', msg: error.data.error }
            //    ];
            //});
        };

        /**
         * Loads default form fields
         */
        $scope.loadForm = function(){
        };

        $scope.postProcess = function(model) {
        };

        $scope.postProcessingCollection = function(entities){
            _.each(entities, function(entity){
                $scope.postProcess(entity);
            });
        };

        $scope.rankingSystemService = rankingSystemService;

        $scope.columnInfo = [
            {title: "Name", field:"name", baseLink:"#/rankingSystem/view/", linkField: "_id", link:true}
        ];

        $scope.create = function(){
            $scope.createRankingSystem($scope.rankingSystem);
        };

        $scope.createRankingSystem = function(rankingSystem){
            rankingSystemService.save({}, rankingSystem, function(response){
                    $location.path('rankingSystem/view/'+ response._id);
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "create " + error.data.error }
                    ];
            });
        };

        $scope.copy = function(){
            var copiedSystem = _.cloneDeep($scope.rankingSystem);
            delete copiedSystem._id;
            delete copiedSystem.$resolved;
            delete copiedSystem.$promise;
            delete copiedSystem.__v;
            copiedSystem.name += " Copy";
            $scope.createRankingSystem(copiedSystem);
        };

        $scope.save = function(){
            $scope.rankingSystem.$update(function(data){
                    $scope.alerts = [
                        { type: 'success', msg: "Updated " + data.name }
                    ];
                    $scope.loadRankingSystem(data);
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "update " + error.data.error }
                    ];
                });
        };

        $scope.deleteEntity = function(){
            $scope.rankingSystem.$delete(function(data){
                    delete $scope.rankingSystem;
                    $scope.alerts = [
                        { type: 'success', msg: "Deleted " + data.name }
                    ];
                    $location.path('/rankingSystem');
                },
                function(error){
                    $scope.alerts = [
                        { type: 'danger', msg: "delete " + error.data }
                    ];
                }
            );
        };

        $scope.groupBySeries = function(allotments){
            var grouped = _.groupBy(allotments, function(item){
                return item.series;
            });
            return _.map(_.keys(grouped), function(key){
                return {series: key,  allotments: grouped[key]}
            });
        };

        $scope.addCommonCriteria = function(){
            if (!$scope.rankingSystem){
                $scope.rankingSystem = {};
            }

            if (!$scope.rankingSystem.commonCriteria){
                $scope.rankingSystem.commonCriteria = [];
            }

            $scope.rankingSystem.commonCriteria.push({});
            $scope.editCommonCriteria($scope.rankingSystem.commonCriteria.length-1);
        };
        $scope.editCommonCriteriaEnabled = false;
        $scope.editCommonCriteria = function(change){
            $scope.editCommonCriteriaEnabled = change;
        };

        $scope.removeCommonCriteria = function(index){
            if ($scope.rankingSystem != null &&
                $scope.rankingSystem.commonCriteria != null &&
                $scope.rankingSystem.commonCriteria[index] != null){
                $scope.rankingSystem.commonCriteria.splice(index,1);
            }
        };

        $scope.loadForm();
    }
);