var parseArgs = require('minimist'),
    _         = require('underscore');

// for options see https://github.com/substack/minimist
var argOpts = {
    'boolean' : ['P', 'help', 'v', 'version']
};
var params = parseArgs(process.argv.slice(2), argOpts);
switch (params['_'][0]) {
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

if (params['p'] || params['project']) var project = params['p'] || params['project'];

module.exports = {
    root       : process.env.PWD,
    dist       : '/pub/deploy',
    params,
    task,
    help       : params.help,
    version    : params.v || params.version,
    production : params.P,
    project,
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