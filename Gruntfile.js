'use strict';

var lrSnippet = require('connect-livereload')();

var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var pathConfig = {
        app : 'app',
        dist : 'dist',
        tmp : '.tmp',
        test : 'test'
    };

    grunt.initConfig({
        paths : pathConfig,
        watch : {
            compass : {
                files : ['<%= paths.app %>/compass/{,*/}*/{,*/}*.{scss,sass,png,ttf}'],
                tasks : ['compass:server']
            },
            test : {
                files : ['<%= paths.app %>/javascripts/**/*.js'],
                tasks : ['jshint:test'],
                options : {
                    spawn : false
                }
            },
            livereload: {
                files: [
                    '<%= paths.app %>/*.html',
                    '<%= paths.app %>/javascripts/**/*.js',
                    '<%= paths.app %>/images/**/*.*',
                    '<%= paths.tmp %>/stylesheets/**/*.css',
                    '<%= paths.tmp %>/images/**/*.*'
                ],
                options : {
                    livereload : true,
                    spawn : false
                }
            }
        },
        connect : {
            options : {
                port : 9999,
                hostname : '0.0.0.0'
            },
            server : {
                options : {
                    middleware : function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, pathConfig.app)
                        ];
                    }
                }
            }
        },
        open: {
            server : {
                path : 'http://127.0.0.1:<%= connect.options.port %>',
                app : 'Google Chrome Canary'
            }
        },
        clean : {
            dist : ['<%= paths.tmp %>', '<%= paths.dist %>'],
            server : '<%= paths.tmp %>'
        },
        useminPrepare : {
            html : ['<%= paths.tmp %>/*.html'],
            options : {
                dest : '<%= paths.dist %>'
            }
        },
        usemin: {
            html : ['<%= paths.dist %>/*.html'],
            options : {
                dirs : ['<%= paths.dist %>']
            }
        },
        htmlmin : {
            dist : {
                files : [{
                    expand : true,
                    cwd : '<%= paths.tmp %>',
                    src : ['*.html'],
                    dest : '<%= paths.dist %>'
                }]
            }
        },
        copy : {
            dist : {
                files : [{
                    expand : true,
                    dot : true,
                    cwd : '<%= paths.app %>',
                    dest : '<%= paths.dist %>',
                    src : [
                        'images/**/*.{webp,gif,png,jpg,jpeg}',
                        'robots.txt'
                    ]
                }]
            },
            tmp : {
                files : [{
                    expand : true,
                    dot : true,
                    cwd : '<%= paths.app %>',
                    dest : '<%= paths.tmp %>',
                    src : [
                        'components/**/*.*',
                        'thirdparty/Adonis/dist/adonis.css',
                        'javascripts/**/*.js',
                        '*.html'
                    ]
                }, {
                    expand : true,
                    dot : true,
                    cwd : '<%= paths.app %>/thirdparty/Adonis/images',
                    src : '*.{webp,gif,png,jpg,jpeg}',
                    dest : '<%= paths.dist %>/images'
                }]
            }
        },
        compass : {
            options : {
                sassDir : '<%= paths.app %>/compass/sass',
                cssDir : '<%= paths.tmp %>/stylesheets',
                imagesDir : '<%= paths.app %>/compass/images',
                fontsDir : '<%= paths.app %>/compass/fonts',
                relativeAssets : true
            },
            build : {
                options : {
                    cssDir : '<%= paths.tmp %>/stylesheets',
                    generatedImagesDir : '<%= paths.tmp %>/images',
                    outputStyle : 'compressed',
                    httpGeneratedImagesPath: 'http://img.wdjimg.com/account/images/',
                    relativeAssets : false
                }
            },
            server : {
                options : {
                    cssDir : '<%= paths.tmp %>/stylesheets',
                    generatedImagesDir : '<%= paths.tmp %>/images',
                    debugInfo : true
                }
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= paths.dist %>/javascripts/**/*.js',
                        '<%= paths.dist %>/stylesheets/**/*.css'
                    ]
                }
            }
        },
        imagemin : {
            dist : {
                files : [{
                    expand : true,
                    cwd : '<%= paths.tmp %>/images',
                    src : '**/*.{png,jpg,jpeg}',
                    dest : '<%= paths.dist %>/images'
                }]
            }
        },
        requirejs : {
            dist : {
                options : {
                    optimize : 'uglify',
                    uglify : {
                        toplevel : true,
                        ascii_only : false,
                        beautify : false
                    },
                    preserveLicenseComments : true,
                    useStrict : false,
                    wrap : true
                }
            }
        },
        jshint : {
            test : ['<%= paths.app %>/javascripts/**/*.js'],
            options : {
                ignores: [
                    '<%= paths.app %>/javascripts/backbone.js',
                    '<%= paths.app %>/javascripts/underscore.js',
                    '<%= paths.app %>/javascripts/DD_belatedPNG_0.0.8a-min.js'
                ]
            }
        },
        karma : {
            options : {
                configFile : '<%= paths.test %>/karma.conf.js',
                browsers : ['Chrome_without_security']
            },
            server : {
                reporters : ['progress'],
                background : true
            },
            test : {
                reporters : ['progress', 'junit', 'coverage'],
                preprocessors : {
                    '<%= paths.app %>/javascripts/**/*.js' : 'coverage'
                },
                junitReporter : {
                    outputFile : '<%= paths.test %>/output/test-results.xml'
                },
                coverageReporter : {
                    type : 'html',
                    dir : '<%= paths.test %>/output/coverage/'
                },
                singleRun : true
            },
            travis : {
                browsers : ['PhantomJS'],
                reporters : ['progress'],
                singleRun : true
            }
        },
        bump : {
            options : {
                files : ['package.json', 'bower.json'],
                updateConfigs : [],
                commit : true,
                commitMessage : 'Release v%VERSION%',
                commitFiles : ['-a'],
                createTag : true,
                tagName : 'v%VERSION%',
                tagMessage : 'Version %VERSION%',
                push : false
            }
        },
        replace: {
            cdn: {
                src: ['<%= paths.dist %>/*.html'],
                overwrite: true,
                replacements: [{
                    from: /<script(.+)src=['"]([^"']+)["']/gm,
                    to: '<script$1src="http://s.wdjimg.com/account/$2"'
                }, {
                    from: /<link([^\>]+)href=['"]([^"']+)["']/gm,
                    to: '<link$1href="http://s.wdjimg.com/account/$2"'
                }]
            }
        },
        wandoulabs_deploy : {
            options : {
                authKey : '.wdrc'
            },
            cdn : {
                deployCDN : {
                    src : '<%= paths.dist %>',
                    target : 'account'
                }
            }
        },
        shell: {
            buildAdonis : {
                options : {
                    stdout : true
                },
                command : ['cd app/thirdparty/Adonis', 'grunt build'].join('&&')
            }
        }
    });

    grunt.registerTask('server', [
        // 'shell:buildAdonis',
        'clean:server',
        'compass:server',
        'connect:server',
        // 'karma:server',
        // 'open',
        'watch'
    ]);

    grunt.registerTask('test', [
        'jshint:test',
        'karma:test'
    ]);

    grunt.registerTask('test:travis', [
        'jshint:test',
        'karma:travis'
    ]);

    grunt.registerTask('build', [
        'shell:buildAdonis',
        'clean:dist',
        'compass:build',
        'copy:tmp',
        'copy:dist',
        'useminPrepare',
        'concat',
        'uglify',
        // 'requirejs:dist', // Uncomment this line if using RequireJS in your project
        'imagemin',
        'htmlmin',
        'rev',
        'usemin'
    ]);

    grunt.registerTask('deployCDN', [
        'build',
        'replace:cdn',
        'wandoulabs_deploy:cdn'
    ]);
};
