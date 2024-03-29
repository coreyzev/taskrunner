var z            = require('./environment'),
    npath        = require('path'),
    util         = require('util'),
    _            = require('underscore'),
    find         = require('findit'),
    EventEmitter = require('events').EventEmitter,
    chalk        = require('chalk'),
    watch        = require('watch'),
    Build        = require('./build'),
    notifier     = require('node-notifier');

var build = new Build();

function Watch () {
    var self = this;
    EventEmitter.call(self);
};
util.inherits(Watch, EventEmitter);

var watchOptions = {};

function buildDirectory (path, type) {

};

Watch.prototype.all = function(project) {
    if (project) {
        var directory = z.getDir(project).fullPath;
    } else {
        var directory = npath.join(z.root, 'source');
    }
    console.log('watching', directory, '\n');
    watch.createMonitor(directory, watchOptions, function (monitor) {
        monitor.on('created', function(file, stat) {
            // check file type, location, and build
            // use file var
            // subtract root from front
            // walk up array of directory names until one matches z.filetree[x] (else simplename) (else fail)
            // build on project & type
            console.log('file created\n','file: ', file, '\nstat: ', stat);

        });
        monitor.on('changed', function(file, stat) {
            // check file type, location, and build
            // consider adding file extensions to config
            // meanhwhile:
            var starttask = process.uptime();
            var validBuildExtensions = ['.less','.js','.png','.jpg','.jpeg','.gif'];
            var fileObj = npath.parse(file);
            var isSourceFile = _.contains(validBuildExtensions, fileObj.ext);
            if (isSourceFile) {
                build.all();
                console.log('file changed:',file);
                build.on('build-done', function() {
                    var endtask = process.uptime();
                    var elapsed = endtask - starttask;
                    var uptime = (elapsed > 10) ? elapsed + 'sec' : elapsed * 1000 + '\u03BCs';
                    if (!z.params.s) {
                        notifier.notify({
                            'title'   : 'Taskrunner Finished',
                            'subtitle': 'task: '+ z.task,
                            'message' : 'Finished in ' + uptime,
                            'sound'   : 'Pop'
                        });
                    }
                });
            }
        });

        // TODO - add monitor.on('remove'), but it will be a lot more complicated
        // * log removed file
        // * check for existence of "order" and ask if you want to remove it from order
        // * run build
    });
};

module.exports = Watch;