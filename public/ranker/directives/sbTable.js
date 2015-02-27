angular.module('directives')
    .directive('sbTable', function(headerHelperService, $filter, rankerEventBus) {
        function linkBody(scope, element, attrs) {

            scope.noRecords = true;
            scope.noSearchRecords = false;
            scope.showAdvancedSearch = false;
            scope.perPageOptions = [{"name":"10","value":10},
                {"name":"15","value":15},
                {"name":"25","value":25},
                {"name":"50","value":50},
                {"name":"100","value":100}];

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

            scope.clearSearch = function(){
                scope.searchParams.like = '';
            };

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

            scope.parseSearchOptions = function(){
                return _.chain(scope.searchFields)
                    .map(scope.parseSearchField)
                    .filter(function(f){return f!=null;})
                    .reduce(_.merge)
                    .value();
            };

            scope.parseSearchField = function(searchField){
                if (searchField.selected != null){
                    if (searchField.field != null){
                        var value = searchField.selected.toString().trim();
                        if (value.length > 0){
                            var searchFieldPair = {};
                            searchFieldPair[searchField.field] = searchField.selected.toString().trim();
                            return searchFieldPair;
                        } else {
                            return null;
                        }
                    } else if (searchField.fieldComplex != null) {
                        return scope.parseSearchFieldComplex(searchField.selected, searchField.fieldComplex);
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            };

            scope.parseSearchFieldComplex = function(selected, complexFields){
                if (selected != null && complexFields != null && complexFields.length > 0){
                    return _.chain(complexFields)
                        .map(function(subField){
                            return scope.parseSubField(selected, subField);
                        })
                        .reduce(_.merge)
                        .value();
                } else {
                    return null;
                }
            };

            scope.parseSubField = function(selected, subField){
                var subFieldPair = {};
                if (subField.dataType != null && subField.dataType == 'date'){
                    subFieldPair[subField.queryName] = moment(selected[subField.selectedValue]).format();
                } else {
                    subFieldPair[subField.queryName] = selected[subField.selectedValue].toString().trim();
                }
                return subFieldPair;
            };

            scope.loadModels = function() {
                var queryParams = {};
                if (scope.searchFields != null){
                    queryParams = _.extend(scope.searchParams, scope.parseSearchOptions());
                } else {
                    queryParams = scope.searchParams;
                }
                scope.modelService.query(queryParams, function(resultModels, headers) {
                    scope.models = resultModels;
                    scope.noRecords = scope.models.length == 0 && scope.searchParams.like == '';
                    scope.noSearchRecords = scope.models.length == 0 && scope.searchParams.like != '';
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
                scope.$watch('searchFields', function(oldVal, newVal){
                    if (newVal){
                        scope.loadModels();
                    }
                }, true);
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

