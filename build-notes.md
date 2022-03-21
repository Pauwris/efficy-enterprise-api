# Build-notes

## Introduction

The Efficy Enterprise API is developed with Visual Studio Code and [Node.js](https://nodejs.org/en/) v16.13.2

## Build or pre-publish

To add an entry to the "devDependencies" attribute of a `package.json` file, on the command line, run the following command:

```ps
npm install <package-name> --save-dev
```

Some packages are interesting for global usage (one time installation) for other Node.js projects, e.g. [jsDoc](https://www.npmjs.com/package/jsdoc) and [rollup](https://www.npmjs.com/package/rollup):
```ps
npm install --save-dev --global jsdoc
npm install --save-dev --global rollup
```ps

We can use [rollup-plugin-terser](https://www.npmjs.com/package/rollup-plugin-terser) to minify generated es bundle, the dist files with `.min.js` extensions.
```ps
npm install --save-dev rollup-plugin-terser
```


## Usage of Rollup

[Usage guide](https://rollupjs.org/guide/en/)

Rollup is a module bundler for JavaScript which compiles small pieces of code into something larger and more complex, such as a library or application

Execute rollup with default config file [rollup.config.js](rollup.config.js)
```ps
rollup -c
```

Minify generated es bundle with [rollup-plugin-terser](https://www.npmjs.com/package/rollup-plugin-terser)

## Usage of jsDoc

```ps
jsdoc --configure jsdoc.conf.json
```