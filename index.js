#!/usr/bin/env node

var z      = require('./lib/environment'),
    Config = require('./lib/config'),
    Build  = require('./lib/build'),
    Watch  = require('./lib/watch'),
    chalk  = require('chalk');

var config = new Config(),
    build  = new Build(),
    watch  = new Watch();

if (z.help) {
    console.log(
        '\n We are still generating text for manual.\n',
        'Here is the link to our readme. Copy and paste it into your browser.\n\n',
        '>      ' + chalk.yellow('https://bitbucket.org/zerveinc/taskrunner/src/0f9fd512a926ca2faad36554a687119e40bfd0bd'),
        '\n'
    );
    process.exit(1);
};

config.generateFiletree();
config.copyVendorCode();

config.on('done', function() {
    switch (z.task){
        case 'build':
            console.log('\nBuilding', z.project ? chalk.cyan(z.project) : '', '\n');
            build.all(z.project);
            break;
        case 'watch':
            console.log('\n> change a file, see its stats. Actual compiling on change coming soon.');
            watch.all(z.project);
            break;
        case 'deploy':
            console.log('\nWe are also looking forward to the deploy feature. Thanks!\n');
            process.exit(1);
            break;
        default:
            console.log('\nThanks for using the zerve cli.\n');
            process.exit(1);
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
