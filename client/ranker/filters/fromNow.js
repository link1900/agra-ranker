angular.module('filters').filter('fromNow', function() {
    return function(input,format) {
        switch(format){
            case 'both':
                return moment(input).fromNow() + " (" + moment(input).format('MMM D, YYYY h:mm:ss A') + ")";
            case 'bothMed':
                return moment(input).format('D MMM YYYY h:mm:ss A') + " - " + moment(input).fromNow();
            default:
                return moment(input).fromNow();
        }
    }
});
