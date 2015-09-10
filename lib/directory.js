// Use this module to build a new directory object.
var z            = require('./environment'),
    path         = require('path'),
    _            = require('underscore'),
    util         = require('util'),
    EventEmitter = require('events').EventEmitter,
    fse          = require('fs-extra'),
    chalk        = require('chalk');
// rl causes a hang
// var rl = require('readline').createInterface(
//     process.stdin, process.stdout
// );

function Directory (dir) {
    var self = this;

    var localPath = dir.substr(z.root.length),
        dirSource = path.parse(localPath),
        parents   = dirSource.dir.split(path.sep);

    this.name     = dirSource.name;
    this.parent   = dirSource.dir.split(path.sep).pop();
    this.path     = '.' + localPath + '/';
    this.fullPath = path.join(z.root, localPath, '/');
    this.index    = z.filetree.length;
};

Directory.prototype.has = function (arg) {
    var contents = fse.readdirSync(z.root + this.path.slice(1, -1));
    var findDir = function (arg) {
        if (contents.indexOf(arg) >= 0) {
            return true;
        } else {return false;}
    };
    switch (arg) {
        case 'styles':
        case 'scripts':
        case 'img':
            return findDir(arg);
            break;
        default:
            console.error(new Error(chalk.red('Please choose a method: "styles", "scripts" or "img".')).stack);
            process.exit(1);
    }
};

Directory.prototype.saveOrder = function (data) {
    // save order json to dir object
};


Directory.add = function (data) {
    // gets json of data & adds it to z.filetree
    var exists = _.findWhere(z.filetree, {'name': data.name});
    if (!exists) {
        z.filetree.push(data);
    } else {
        var origDir = _.findWhere(z.filetree, {'name': data.name});
        var newDir = data;
        origDir['simpleName'] = origDir.name;
        newDir['simpleName'] = newDir.name;
        origDir.name = origDir.path.slice(0,-1).split(path.sep).splice(2).join('/');
        newDir.name = data.path.slice(0,-1).split(path.sep).splice(2).join('/');
        z.filetree.push(data);
    }
};

function multiplePrompt (string) {
    // use this to prompt when multiple options exist
    console.error(new Error(chalk.red('More than one result when searching the filetree for: ' + string)));
    process.exit(1);
}

z.getDir = Directory.getDir = function(string) {
    // Call using: z.getDir('string')
    var firstChar = string.charAt(0);
    var method = (firstChar == '/' || firstChar == '.') ? 'path' : 'name';
    if (z.filetree) {
        switch (method){
            case 'path':
                if (firstChar == '.') { var isSource = (string.substr(2,6) == 'source');};
                if (firstChar == '/') { var isSource = (string.indexOf('source') >= 0);};
                if (!isSource) {
                    console.error(new Error(chalk.red('An inproper input was used for getDir(). ' + string)).stack);
                    process.exit(1);
                }
                var query = (firstChar == '/') ? {'fullPath': string} : {'path': string};
                var result = _.findWhere(z.filetree, query);
                if (result) {
                    return result;
                    break;
                }
                else {
                    console.error(new Error(chalk.red('No directory listing found: ' + query)).stack);
                    process.exit(1);
                }
                // } else {
                //     console.error(new Error(chalk.red('The path you entered: ' + query + '\nis either not in this filesystem or not a valid path.')).stack);
                //     process.exit(1);
                // }
            case 'name':
                var results = _.where(z.filetree, {'name': string});
                switch (results.length) {
                    case 0:
                        results = _.where(z.filetree, {'simpleName': string});
                        if (results) {
                            multiplePrompt(results);
                        } else {
                            return false;
                        }
                        break;
                    case 1:
                        return results[0];
                        break;
                    default:
                        multiplePrompt(results);
                        break;
                }
                break;
            default:
                console.error(new Error(chalk.red('An inproper input was used for getDir(). ' + string)).stack);
                process.exit(1);
        }
    } else {
        console.error(new Error('z.filetree does not exist yet').stack);
    }
};

module.exports = Directory;