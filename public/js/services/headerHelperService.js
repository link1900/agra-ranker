angular.module('services').service('headerHelperService',  function() {
    var headerHelper = {};

    headerHelper.totalItemsFromHeader = function(headerObject) {
        if (headerObject.total){
            return headerObject.total;
        } else {
            return 0;
        }
    };

    return headerHelper;
});