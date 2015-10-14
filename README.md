# Zerve TaskRunner (to be named)

**Version**: 0.1.2

* * *

[Installation](#markdown-header-installation) | [File Structure](#markdown-header-file-structure) | [Usage](#markdown-header-usage) | [Issues](#markdown-header-issues)

* * *

## Installation

**The following assumes you have a package.json in your project. If you need help, [see here](https://docs.npmjs.com/getting-started/installing-npm-packages-locally#using-package-json-and-the-save-flag). More info on [package.json](https://docs.npmjs.com/files/package.json).**

##### Install this taskrunner:

```sh
npm install git+ssh://bitbucket/zerveinc/taskrunner.git#v0.1.2 --save-dev
```

*If you get an `EACCES` error: [check this page for help](https://docs.npmjs.com/getting-started/fixing-npm-permissions#option-1-change-the-permission-to-npm-s-default-directory)*

*If your `node -v` is less than v4: [click here for more info](#markdown-header-node-issues)*

* * *

## Usage

```sh
zerve <command> [options] [args]
```
###### Commands

One of the below commands can be run at a time.

Build: `build` or `b`

Watch: `watch` or `w` - *still in development*

Deploy: `deploy` or `d` - *planned*

###### Options

Production: `-P` *case sensitive* -  Will flag *production* as true and will
modify the output. It will compress the compiled javascript. Adjust the urls in stylesheets.

Version: `-v` or `--version`

###### Args

Project: `--project=[project name]` or `-p=[project name]` *case sensitive* -
Where *[project name]* is the same as the name of the project folder. Can be
used with *build* and *watch*.

Help: `--help` - For now will provide you with the link to this page.

* * *

## File Structure

    App Folder
    ├── source/
    |   ├── [project name]/
    |   |   ├── _project.js
    |   |   ├── styles/
    |   |   |   ├── index.less
    |   |   |   └── _imported.less
    |   |   ├── scripts/
    |   |   |   ├── scriptFile1.js
    |   |   |   └── scriptFile2.js
    |   |   └── img/
    |   |       └── ...
    |   ├── ...
    ├── pub/
    |   ├── js/
    |   |   └── [project name]/
    |   |       └── scripts.js
    |   ├── css/
    |   |   └── [project name]/
    |   |       └── styles.css
    |   └── img/
    |       └── [project name]/
    |           └── ...
    └── package.json


**Source** This is the expected file structure to use this tool. It will look for
the `source/` folder and then create a collection of all the project folders
within it. You can set folders to ignore in configuration.

**Project Folder** The project folder contains your development files. The tool
will only run the tasks for exisiting folders that need it. If you have no styles
folder, it will not run the less compiler.

* *_project.js* - this is your project configuration file. Do not change the name of
this file. In this file you can define the order in which your javascript is
concatenated. Will eventually be extended for other configuration as well.

* *styles* - The LESS compiler is going to look for an `index.less` file, and will
use that file to import all of its dependencies. We have a suggested environment
structure for your less. More info TBA.

* *scripts* - Script files go here. Order will be decided alphanumerically if no
`_project.js` order config is defined.

* *img* - store your images here, they will be copied over to pub. There is a less mixin
we provide to handle images from other projects.

**Pub Folder** *This folder will be generated on build*. It will create `js`,
`css`, & `img`, folders which you can call in your code. The destination can be
defined in configuration.

* * *

## Issues?

If you run into any issues, please go here and document them:
[Zerve Taskrunner Issues](https://bitbucket.org/zerve_coreyholland/taskrunner/issues)

Please make sure your node version is up to date.

## Roadmap

See feature plans & proposals here:
[Proposals & Enhancements](https://bitbucket.org/zerveinc/taskrunner/issues?kind=proposal&kind=enhancement&sort=milestone)

* * *

## Requires

**node**: 4.0.0 or 0.12.x

**npm**: 2.5.1

## Dependencies

chalk, copy, esprima, findit, fs-extra, less, minimist, uglify-js, underscore, watch

## Node Issues

### Installing or updating node

##### Install **nvm** Node Version Manager ([more info on install](https://github.com/creationix/nvm#install-script)):
*First you'll need to make sure your system has a c++ compiler. For OSX, XCode will work, for Ubuntu, the build-essential and libssl-dev packages work.*
```sh
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.26.1/install.sh | bash
```

##### Install **node** ([more info on using nvm](https://github.com/creationix/nvm#usage)):

```sh
nvm install stable
nvm use stable
```

###### Pro-tip: To set a default Node version to be used in any new shell, use the alias 'default':

```sh
nvm alias default stable
```