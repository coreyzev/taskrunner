var z            = require('./environment'),
    find         = require('findit'),
    path         = require('path'),
    util         = require('util'),
    EventEmitter = require('events').EventEmitter,
    Directory    = require('./directory');

function Config () {

    var self = this;
    EventEmitter.call(self);

    self.addToTree = function (dir) {
        //Convert to Directory.add()
        var name = dir.split(path.sep).pop();
        if ( z.dirIgnore.indexOf(name) >= 0) {
            if (!z.isInitBuild)
                console.log("This file is on the ignore list: " + dir.substr(z.root.length));
            return;
        }
        Directory.add(new Directory(dir));
    };

    self.on('filetreeDone', function () {
        self.emit('done');
    });

};

util.inherits(Config, EventEmitter);

Config.prototype.generateFiletree = function () {
    /* @desc Add directory objects to filetree array */
    // make async
    var self = this;
    z.isInitBuild = true;

    var findSource = find(z.root + '/source');

    findSource.on('directory', function (dir, stat, stop) {
        self.addToTree(dir);
    });

    findSource.on('end', function () {
        z.isInitBuild = false;
        self.emit('filetreeDone');
    })
};

Config.prototype.copyVendorCode = function () {
    // use this function to copy code to the public directory.
};

module.exports = Config;