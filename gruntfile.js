module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            js: {
                files: ['gruntfile.js', 'server.js', 'app/**/*.js', 'public/js/**', 'test/**/*.js'],
                options: {
                    livereload: true
                }
            },
            html: {
                files: ['templates/**'],
                tasks: ['includeSource','string-replace:version'],
                options: {
                    livereload: true
                }
            },
            css: {
                files: ['public/css/**'],
                options: {
                    livereload: true
                }
            }
        },
        jshint: {
            all: {
                src: ['gruntfile.js', 'server.js', 'app/**/*.js', 'public/js/**', 'test/**/*.js'],
                options: {
                    jshintrc: true
                }
            }
        },
        nodemon: {
            dev: {
                options: {
                    file: 'server.js',
                    args: [],
                    ignoredFiles: ['public/**'],
                    watchedExtensions: ['js'],
                    nodeArgs: ['--debug'],
                    delayTime: 1,
                    env: {
                        PORT: 3000
                    },
                    cwd: __dirname
                }
            }
        },
        concurrent: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        },
        env: {
            test: {
                NODE_ENV: 'test',
                testUrl: 'http://localhost:3001'
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['specs/**/*.spec.js']
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
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-include-source');

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    grunt.registerTask('build', ['includeSource','string-replace:version']);

    //Default task(s).
    grunt.registerTask('default', ['includeSource','string-replace:version','concurrent']);

    //Test task.
    grunt.registerTask('test', ['includeSource','string-replace:version','env:test','mochaTest']);
};
