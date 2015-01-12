angular.module('filters').filter('fromNow', function() {
    return function(input,format) {
        switch(format){
            case 'both':
                return moment(input).fromNow() + " (" + moment(input).format('MMM D, YYYY h:mm:ss A') + ")";
                break;
            default:
                return moment(input).fromNow();
                break;
        }
    }
});
