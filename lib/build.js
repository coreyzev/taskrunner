var z            = require('./environment'),
    npath        = require('path'),
    util         = require('util'),
    _            = require('underscore'),
    find         = require('findit'),
    EventEmitter = require('events').EventEmitter,
    spawn        = require('child_process').spawn,
    fs          = require('fs'),
    chalk        = require('chalk');

var js   = require('uglify-js'),
    copy = require('copy');

// project = name
// proj    = project object

function Build () {
    var self = this;
    EventEmitter.call(self);

    // var tasksDone;
    // var tasksStarted = 0;
    // function taskDone () {
    //     if (!tasksDone) tasksDone = 0;
    //     tasksDone++;
    //     if (tasksDone === tasksStarted) {
    //         tasksDone = undefined;
    //         tasksStarted = 0;
    //         self.emit('build-done');
    //     }
    // };

    // self.on('build-scripts-done', taskDone);
    // self.on('build-styles-done', taskDone);
    // self.on('build-images-done', taskDone);

    function newFileConsole (type, path) {
                // TODO - possibly convert to npath.relative()
                console.log(chalk.green('New ' + chalk.cyan(type) + ' file at: '), path);
    };

    self.buildTest = function (project, subtask) {
        if (project) {
            switch (subtask) {
                case 'styles':
                    self.buildStyles(project);
                    break;
                case 'scripts':
                    self.buildScripts(project);
                    break;
                case 'images':
                    self.buildImages(project);
                    break;
                default:
                    self.buildProject(project);
                    break;
            };
        } else {
            switch (subtask) {
                case 'styles':
                    z.filetree.forEach(function (proj, index) {
                        self.buildStyles(proj.path, true);
                    });
                    break;
                case 'scripts':
                    z.filetree.forEach(function (proj, index) {
                        self.buildScripts(proj.path, true);
                    });
                    break;
                case 'images':
                    z.filetree.forEach(function (proj, index) {
                        self.buildImages(proj.path, true);
                    });
                    break;
                default:
                    z.filetree.forEach(function (proj, index) {
                        self.buildProject(proj.path, true);
                    });
                    break;
            };
        }
    };

    self.readOrder = function (dir, callback) {
        // this function needs to check if there are files in scripts that arent in
        // "order" and then concat them after
        var self = this;
        var proj = z.getDir(dir);
        var configFile = require(npath.join(proj.fullPath, "_project"));
        if (configFile.scripts && configFile.scripts.order) {
            var data   = configFile.scripts.order;
            var output = [];
            proj.saveOrder(data);
            data.forEach(function (file, i) {
                output[i] = npath.join(proj.fullPath, 'scripts', file);
            });
            return callback(output);
        } else {
            var listFiles = find(npath.join(proj.fullPath, 'scripts'));
            var data = [];
            listFiles.on('file', function (file, stat) {
                if (npath.parse(file).ext == '.js') data.push(file);
            });
            listFiles.on('end', function () {
                if (data[0]) { return callback(data); }
                else { self.emit('build-scripts-done'); }
            });
        }
    };

    self.readStyles = function (dir) {
        // body...
    };

    self.readScripts = function (dir) {
        // body...
    };

    self.readProject = function (dir) {

    };

    self.buildProject = function (project, fullBuild) {
        var proj = z.getDir(project);
        if (proj.has('styles'))     self.buildStyles(proj, fullBuild);
        if (proj.has('scripts'))    self.buildScripts(proj, fullBuild);
        if (proj.has('img'))        self.buildImages(proj, fullBuild);
    };

    self.buildStyles = function (proj, fullBuild) {
        var self = this;
        tasksStarted++;
        var lessInput = npath.join(proj.fullPath, 'styles/index.less');
        // if (inputExists) {
            var lessOutput = npath.join(z.root, z.dist, '/css/', proj.name, '/styles.css');
            var lessOptions = [
                '-s', // silence output
                // '--source-map', // create source map
                // '--source-map-less-inline', // inline source map
                '--source-map-rootpath=' + npath.join(proj.fullPath, 'styles/'), // location of source files
                // z.production ? '--modify-var="production=true"' : '--global-var="production=false"', // not currently working
                // '--include-path=PATH1;PATH2', can be used to set paths to vendor less, see docs: Usage > options
                lessInput,
                lessOutput
            ];

            // for dev env use:
            var child = spawn('lessc', lessOptions);

            // Listen for any errors:
            child.stderr.on('data', function (data) {
                console.log('lessc posted an error: \n' + chalk.red(data));
            });

            // Listen for an exit event:
            child.on('exit', function (exitCode) {
                if (!exitCode) newFileConsole('css', npath.join('.', z.dist, 'css',proj.name,'styles.css'));
                self.emit('build-styles-done');
            });
        // } else {
        //     self.emit('build-styles-done');
        // }

    };

    self.buildScripts = function (proj, fullBuild) {
        var self = this;
        tasksStarted++;
        // refer to https://github.com/mishoo/UglifyJS2#the-hard-way if one day we need more than concatenation
        this.readOrder(proj.path, function(data){
            var files = data;
            var result = js.minify(files, {
                // todo - add map options here
                mangle: z.production,
                compress: z.production,
                output: {
                    indent_start  : 0,     // start indentation on every line (only when `beautify`)
                    indent_level  : 4,     // indentation level (only when `beautify`)
                    quote_keys    : false, // quote all keys in object literals?
                    space_colon   : true,  // add a space after colon signs?
                    ascii_only    : false, // output ASCII-safe? (encodes Unicode characters as ASCII)
                    inline_script : false, // escape "</script"?
                    width         : 80,    // informative maximum line width (for beautified output)
                    max_line_len  : 32000, // maximum line length (for non-beautified output)
                    beautify      : !z.production, // beautify output?
                    source_map    : null,  // output a source map
                    bracketize    : false, // use brackets every time?
                    comments      : true, // output comments?
                    semicolons    : false  // use semicolons to separate statements? (otherwise, newlines)
                }
            });
            var filename = npath.join(z.root, z.dist, '/js/', proj.name, '/scripts.js');
            function outputFile (file, data, encoding, callback) {
                var dir = npath.dirname(file)
                fs.exists(dir, function (itDoes) {
                    if (itDoes) return fs.writeFile(file, data, encoding, callback)
                    fs.mkdir(dir, function (err) {
                        if (err) return callback(err)
                        fs.writeFile(file, data, encoding, callback)
                    });
                });
            };
            outputFile(filename, result.code, 'utf8', function (err) {
                if (err) throw err;
                newFileConsole('script', npath.join('.', z.dist, 'js',proj.name,'scripts.js'))
                self.emit('build-scripts-done');
            });
        });
    };

    self.buildImages = function (proj, fullBuild) {
        var self = this;
        tasksStarted++;
        var sourcePath = npath.join(proj.fullPath, 'img');
        var destPath = npath.join(z.root, z.dist, '/img/', proj.name);

        copy.dir(sourcePath, destPath, function(err, data) {
            if (err) throw err;
            self.emit('build-images-done');
        });
    };
};

util.inherits(Build, EventEmitter);

Build.prototype.all = function (project) {
    var self = this;
    self.buildTest(project);
}

// TODO - combine these 3 into 1
Build.prototype.styles = function (project) {
    var self = this;
    self.buildTest(project, 'styles');
};

Build.prototype.scripts = function (project) {
    var self = this;
    self.buildTest(project, 'scripts');
};

Build.prototype.images = function (project) {
    var self = this;
    self.buildTest(project, 'images');
};

module.exports = Build;