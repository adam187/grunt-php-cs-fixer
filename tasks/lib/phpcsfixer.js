/*
 * Grunt PHP Coding Standard Fixer
 * https://github.com/openxo/grunt-php-cs-fixer
 *
 * Copyright (c) 2013 openXO Ltd.
 * http://www.openxo.com
 * Licensed under the MIT license.
 */
'use strict';

// External libs.
var path = require('path'),
    exec = require('child_process').exec,
    _ = require('underscore');

exports.init = function(grunt) {

    var exports  = {},
        defaults = {
            // Default options
            bin: 'php-cs-fixer',
            level: null,
            fixers: null,
            dryRun: false,
            diff: false,
            verbose: false,
            quiet: false,
            ignoreExitCode: false,
            maxBuffer: 200*1024
        },
        cmd    = null,
        done   = null,
        config = {};

    /**
     * Builds phpunit command
     *
     * @return string
     */
    var buildCommand = function(dir) {

        var cmd = path.normalize(config.bin);

        if (grunt.option('verbose') || config.verbose) {
            cmd += ' --verbose';
        }
        
        cmd += ' fix ' + dir;

        if (grunt.option('level') || config.level) {
            cmd += ' --level=' + config.level;
        }

        if (grunt.option('fixers') || config.fixers) {
            var fixers = config.fixers;
            if (_.isString(config.fixers)) {
                fixers = config.fixers.split(",");
            }
            cmd += ' --fixers=' + fixers.join(",");
        }

        if (grunt.option('dryRun') || config.dryRun) {
            cmd += ' --dry-run';
        }

        if (grunt.option('diff') || config.diff) {
            cmd += ' --diff';
        }

        if (grunt.option('framework') || config.framework) {
            cmd += ' --config=' + config.framework;
        }
        return cmd;
    };

    /**
     * Setup task before running it
     *
     * @param Object runner
     */
    exports.setup = function(runner) {

        var dir = path.normalize(runner.data.dir);
        config  = runner.options(defaults);
        cmd     = buildCommand(dir);

        grunt.log.writeln('Running php-cs-fixer (target: ' + runner.target.cyan + ') in ' + dir.cyan);
        grunt.verbose.writeln('Exec: ' + cmd);

        done    = runner.async();
    };

    /**
     * Runs phpunit command with options
     *
     */
    exports.run = function() {
        var cmdOptions = {
            maxBuffer: config.maxBuffer
        };

        var timeA = +(new Date());
        var memA  = process.memoryUsage().heapUsed;
        grunt.log.writeln();
        exec(cmd, cmdOptions, function(err, stdout, stderr) {

            var timeB = +(new Date());
            var memB  = process.memoryUsage().heapUsed;
            grunt.log.writeln('Time: ' + ((timeB - timeA) / (1000)).toFixed(2) + 's, Memory: ' + ((memB - memA) / (1024 * 1024)).toFixed(2) + 'Mb');

            if (stdout && (grunt.option('verbose') || config.verbose)) {
                grunt.log.write(stdout);
            }

            if (stderr && (!config.ignoreExitCode || (grunt.option('verbose') || config.verbose))) {
                grunt.fatal(stderr);
            }

            if (err && config.dryRun) {
                grunt.fatal(err);
            }

            if (config.dryRun) {
                grunt.log.ok("PHP files valid!");
            } else {
                grunt.log.ok("PHP files fixed!");
            }

            done();
        });
    };

    return exports;
};
