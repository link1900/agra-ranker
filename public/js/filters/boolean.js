angular.module('filters').filter('boolean', function() {
    return function(input, yesMessage, noMessage) {
        if (input){
            if (yesMessage){
                return yesMessage;
            } else {
                return "Yes";
            }

        } else {
            if (noMessage){
                return noMessage;
            } else {
                return "No";
            }
        }
    }
});
