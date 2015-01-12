angular.module('directives')
    .directive('sbTable', function(headerHelperService, $filter, rankerEventBus) {
        function linkBody(scope, element, attrs) {

            scope.noRecords = true;
            scope.noSearchRecords = false;

            scope.searchParams = {
                page : 1,
                per_page : 10,
                sort_field: 'name',
                sort_direction: 'asc',
                like : ''
            };

            if (scope.sortField){
                scope.searchParams.sort_field = scope.sortField;
            }

            if (scope.sortDirection){
                scope.searchParams.sort_direction = scope.sortDirection;
            }

            if (scope.perPage){
                scope.searchParams.per_page = scope.perPage;
            }

            if (scope.searchFields){
                _.extend(scope.searchParams, scope.searchFields);
            }

            if (scope.messageEmpty){
                scope.messageEmpty = "No records";
            }

            if (scope.updateOnEvent){
                scope.$on(scope.updateOnEvent,function() {
                    scope.loadModels();
                });
            }

            scope.updateSearch = function(){
                scope.loadModels();
            };

            scope.clearSearch = function(){
                scope.searchParams.like = '';
                scope.loadModels();
            };

            scope.changePage = function(page){
                scope.searchParams.page = page;
                scope.loadModels();
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
                    scope.noRecords = scope.models.length == 0 && scope.searchParams.like == '';
                    scope.noSearchRecords = scope.models.length == 0 && scope.searchParams.like != '';
                    if (scope.postProcess){
                        scope.postProcess(resultModels);
                    }
                    scope.totalItems = headerHelperService.totalItemsFromHeader(headers());
                });
            };

            scope.loadModels();
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
                searchInfo: '=',
                postProcess: '=',
                searchFields: '=',
                hideSearch: '='
            },
            link: linkBody,
            templateUrl: '/ranker/directives/sbTableTemplate.html'
        };
    });

