angular.module('directives').directive('loginAutoFill', function() {
    return {
        require: "ngModel",
        link: function(scope, element, attrs, ngModel){
            scope.$on("loginAutoFill", function(){
                //apply changes to the scope
                ngModel.$setViewValue(element.val());
            });
        }
    }
});

