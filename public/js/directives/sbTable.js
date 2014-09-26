angular.module('directives')
    .directive('sbTable', function(headerHelperService, $filter) {
        function linkBody(scope, element, attrs) {

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

            scope.searchFieldType = 'text';

            if (scope.searchType){
                scope.searchFieldType = scope.searchType;
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
                messageEmpty: '@',
                searchType: '@',
                modelService: '=',
                columnInfo: '=',
                postProcess: '=',
                searchFields: '=',
                hideSearch: '='
            },
            link: linkBody,
            templateUrl: '/views/directives/sbTableTemplate.html'
        };
    });

