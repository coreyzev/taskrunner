var parseArgs = require('minimist'),
    _         = require('underscore');

// for options see https://github.com/substack/minimist
var argOpts = {
    'boolean' : ['P']
};
var args = parseArgs(process.argv.slice(2), argOpts);
switch (args['_'][0]) {
    case 'build':
    case 'b':
        var task = 'build';
        break;
    case 'watch':
    case 'w':
        var task = 'watch';
        break;
    case 'deploy':
    case 'd':
        var task = 'deploy';
        break;
    default:
        break;
};

if (args['p'] || args['project']) var project = args['p'] || args['project'];

module.exports = {
    root       : process.env.PWD,
    dist       : '/pub/deploy',
    params     : args,
    task       : task,
    production : args.P,
    project    : project,
    filetree   : [],
    dirIgnore  : [
        'source',
        'consumer',
        'software',
        'env',
        'framework',
        'img',
        'scripts',
        'styles'
    ]

};