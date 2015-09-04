module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: {
                src: ['server.js', 'app/**/*.js', 'public/js/**', 'test/**/*.js'],
                options: {
                    jshintrc: true
                }
            }
        },
        'string-replace': {
            version: {
                files: {
                    'public/views/footer.html': 'templates/public/views/footer.html'
                },
                options: {
                    replacements: [{
                        pattern: /{{VERSION}}/g,
                        replacement: '<%= pkg.version %>'
                    }]
                }
            }
        },
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
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-include-source');

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    grunt.registerTask('build', ['includeSource','string-replace:version']);

    //Default task(s).
    grunt.registerTask('default', ['build']);
};
