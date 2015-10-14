#!/usr/bin/env node

var z      = require('./lib/environment'),
    Config = require('./lib/config'),
    Build  = require('./lib/build'),
    Watch  = require('./lib/watch'),
    chalk  = require('chalk'),
    spawn   = require('child_process').spawn,
    prompt = require('prompt');

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
if (z.version) {
    console.log('v' + require('./package.json').version);
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
            var schema = {
                properties: {
                    aws_prefix: {
                        pattern: /^[a-z]{2}$/,
                        message: 'Should be 2 letters, lowercase.' + chalk.cyan(' e.g. "ca"'),
                        required: true
                    }
                }
            };
            prompt.message = "Input needed ";
            prompt.start();
            prompt.get(schema, function (err, result) {
                if (err) { process.exit(1); }
                var prefix = 'prefix=' + result.aws_prefix;
                var confirm = 'confirm=y';
                var cap_cleanup = spawn('cap', ['deploy:cleanup', prefix, confirm], {stdio: 'inherit'});
                console.log("\nplease wait while we use capistrano to deploy\n");
                function cap_deploy_spawn () {
                    var cap_deploy = spawn('cap', ['deploy', prefix, confirm], {stdio: 'inherit'});
                    cap_deploy.on('close', function(code) {
                        if (code) {
                            console.log(chalk.red('There was an error with the deploy.'));
                            process.exit(1);
                        }
                        console.log('\nThe deploy to aws.dev.' + result.aws_prefix + ' was successful.');
                        process.exit(0);
                    });
                };
                cap_cleanup.on('close', function(code) {
                    if (code) {
                        console.log(chalk.red('There was an error with the cleanup.'));
                        process.exit(1);
                    }
                    cap_deploy_spawn();
                });
            });
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
        var uptime = (process.uptime() > 10) ? process.uptime() + 'sec' : process.uptime() * 1000 + '\u03BCs';
        var info = chalk.blue.bgWhite(' This task took ' + uptime + '. ');
        var line = Array(Math.floor(info.length / 1.5)).join('-');
        line = chalk.blue.bold('\n' + line + '\n');
        console.log(line, info, line);
    }
});
