angular.module('directives')
    .directive('sbTable', function(headerHelperService, $filter, rankerEventBus) {
        function linkBody(scope, element, attrs) {

            scope.noRecords = true;
            scope.showAdvancedSearch = true;
            scope.selected = {};
            scope.perPageOptions = [{"name":"10","value":10},
                {"name":"15","value":15},
                {"name":"25","value":25},
                {"name":"50","value":50},
                {"name":"100","value":100}];

            scope.searchParams = {
                page : 1,
                per_page : 10,
                sort_field: 'name',
                sort_direction: 'asc'
            };


            if (scope.sortField){
                scope.searchParams.sort_field = scope.sortField;
            }

            if (scope.sortDirection){
                scope.searchParams.sort_direction = scope.sortDirection;
            }

            if (scope.perPage){
                scope.searchParams.per_page = parseInt(scope.perPage);
            }

            if (scope.messageEmpty){
                scope.messageEmpty = "No records";
            }

            if (scope.updateOnEvent){
                scope.$on(scope.updateOnEvent,function() {
                    scope.loadModels();
                });
            }

            scope.changePage = function(page){
                scope.searchParams.page = page;
            };

            scope.toggleAdvancedSearch = function(){
                scope.showAdvancedSearch = !scope.showAdvancedSearch;
            };

            scope.calculatePageRange = function(page, pageSize, total){
                if (total == 0){
                    return 0;
                } else {
                    var start = (page-1) * pageSize;
                    start = start <= 0 ? 1 : start;
                    var end = page * pageSize;
                    end = end > total ? total : end;
                    return start + "-" + end;
                }

            };

            scope.getValueFromModel = function(model, field){
                var finalResult;
                if (model && field){
                    var result = model;
                    field = field.split('.');
                    for (var i = 0, len = field.length; i < len - 1; i++){
                        if (result){
                            result = result[field[i]];
                        }
                    }

                    if (result){
                        finalResult = result[field[len - 1]];
                    } else {
                        finalResult = '';
                    }
                } else {
                    finalResult = '';
                }
                return finalResult;
            };

            scope.getFieldValue = function(model, column) {
                var field = column.field;
                var finalResult = scope.getValueFromModel(model,  column.field);

                //filter final result
                if (column.filter && column.filterFormat){
                    return $filter(column.filter)(finalResult, column.filterFormat);
                } else if(column.filter) {
                    return $filter(column.filter)(finalResult);
                } else {
                    return finalResult;
                }

            };

            scope.loadModels = function() {
                scope.modelService.query(scope.searchParams, function(resultModels, headers) {
                    scope.models = resultModels;
                    scope.noRecords = scope.models.length == 0;
                    if (scope.postProcess){
                        scope.postProcess(resultModels);
                    }
                    scope.totalItems = headerHelperService.totalItemsFromHeader(headers());
                });
            };

            scope.$watch('searchParams', function(oldVal, newVal){
                if (newVal){
                    scope.loadModels();
                }
            }, true);

            if (scope.searchFields != null){
                _.forEach(scope.searchFields, function(field){
                    if (field.loadOptions != null){
                        field.loadOptions().then(function(results){
                            field.options = results;
                            if (field != null && field.options != null && field.options.length != null && field.options.length > 0){
                                if (field.type === "selectRangeSingle"){
                                    scope.selected[field.name] = field.options[0]._id;
                                    scope.searchParams[field.fieldStart] = field.options[0]._id[field.selectedStart];
                                    scope.searchParams[field.fieldEnd] = field.options[0]._id[field.selectedEnd];
                                } else {
                                    scope.searchParams[field.field] = field.options[0]._id;
                                }
                            }
                        });
                    }
                });
            }

        }

        return {
            restrict: 'A',
            scope: {
                tableTitle: '@',
                perPage : '@',
                sortField: '@',
                sortDirection: '@',
                updateOnEvent: '@',
                messageEmpty: '@',
                modelService: '=',
                columnInfo: '=',
                searchFields: '=',
                postProcess: '=',
                hideSearch: '='
            },
            link: linkBody,
            templateUrl: '/ranker/directives/sbTableTemplate.html'
        };
    });

