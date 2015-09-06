var gulp = require('gulp');
var gls = require('gulp-live-server');

gulp.task('serve', function() {
    //1. run your script as a server
    var server = gls.new('server.js');
    server.start();

    //use gulp.watch to trigger server actions(notify, start or stop)
    gulp.watch([
        'public/ranker/**/*.css',
        'public/ranker/**/*.js',
        'public/ranker/**/*.html'
    ], function (file) {
        server.notify.apply(server, [file]);
    });
    gulp.watch('server.js', server.start.bind(server)); //restart my server
});