var gulp = require('gulp');
var concat = require('gulp-concat');
var templateCache = require('gulp-angular-templatecache');
var gulpSequence = require('gulp-sequence');
var del = require('del');

var paths = {
    scripts: ['client/ranker/**/*.js'],
    html: ['client/ranker/**/*.html','client/views/*.html'],
    copy: [
        'client/lib/**/*',
        'client/js/**/*',
        'client/template/**/*',
        'client/css/**/*',
        'client/img/**/*',
        'client/ranker/**/*.html',
        'client/views/**/*',
        'client/index.html',
        'client/ranker/**/*.js'
    ]
};

gulp.task('clean', function() {
    return del(['dist']);
});

gulp.task('html', function () {
    return gulp.src(paths.html)
        .pipe(templateCache())
        .pipe(gulp.dest('dist'));
});

gulp.task('scripts', function() {
    return gulp.src(paths.scripts)
        .pipe(concat('all.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('copy', function(){
    return gulp.src(paths.copy,{"base": "client"}).pipe(gulp.dest('dist'));
});

gulp.task('build', gulpSequence('clean', 'copy', 'scripts'));
