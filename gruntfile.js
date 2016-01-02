module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        includeSource: {
            options :{
                basePath: 'public',
                baseUrl: ''
            },
            main: {
                files: {
                    'public/index.html': 'templates/public/index.html'
                }
            }
        }
    });

    //Load NPM tasks
    grunt.loadNpmTasks('grunt-include-source');

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    grunt.registerTask('build', ['includeSource']);

    //Default task(s).
    grunt.registerTask('default', ['build']);
};
