angular.module('filters').filter('fromNow', function() {
    return function(input,format) {
        switch(format){
            case 'both':
                return moment(input).fromNow() + " (" + moment(input).format('MMM D, YYYY h:mm:ss A') + ")";
                break;
            case 'bothMed':
                return moment(input).format('D MMM YYYY h:mm:ss A') + " - " + moment(input).fromNow();
                break;
            default:
                return moment(input).fromNow();
                break;
        }
    }
});
