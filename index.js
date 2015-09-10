#!/usr/bin/env node

var z      = require('./lib/environment'),
    Config = require('./lib/config'),
    Build  = require('./lib/build'),
    Watch  = require('./lib/watch'),
    chalk  = require('chalk');

var config = new Config(),
    build  = new Build(),
    watch  = new Watch();

config.generateFiletree();
config.copyVendorCode();

config.on('done', function() {
    switch (z.task){
        case 'watch':
            console.log('>');
            watch.all(z.project);
            break;
        case 'deploy':
            console.log('deploy run');
            break;
        default:
            console.log('');
            build.all(z.project);
            break;
    }
});

process.on('exit', function (exitCode) {
    if (!exitCode) {
        // console.log(z.filetree);
        var uptime = chalk.blue.bgWhite(' This task took ' + process.uptime() * 1000 + '\u03BCs. ');
        var line = Array(Math.floor(uptime.length / 1.5)).join('-');
        line = chalk.blue('\n' + line + '\n');
        console.log(line, uptime, line);
    }
});
