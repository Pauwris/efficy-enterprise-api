The Efficy Enterprise API is developed with Visual Studio Code and [Node.js](https://nodejs.org/en/) v16.13.2

## Required npm packages

Some packages are interesting for global usage (one time installation) for other Node.js projects, e.g. [jsDoc](https://www.npmjs.com/package/jsdoc) and [rollup](https://www.npmjs.com/package/rollup):

```powershell
npm install --save-dev --global jsdoc
npm install --save-dev --global rollup
```

[DocStrap](https://www.npmjs.com/package/ink-docstrap) is Bootstrap based template for JSDoc3. In addition, it includes all of the themes from Bootswatch giving you a great deal of look and feel options for your documentation, along with a **simple search**. Additionally, it adds some options to the conf.json file that gives you even more flexibility to tweak the template to your needs. It will also make your teeth whiter.

We create [.d.ts Files from.js files](https://www.typescriptlang.org/docs/handbook/declaration-files/dts-from-js.html), this set up means you can own the editor experience of TypeScript-powered editors without porting your project to TypeScript, or having to maintain .d.ts files in your codebase. TypeScript supports most JSDoc tags.

```powershell
npm install --save-dev rollup-plugin-ignore
npm install --save-dev ink-docstrap
npm install --save-dev typescript
```

## Usage of Rollup

[Usage guide](https://rollupjs.org/guide/en/)

Rollup is a module bundler for JavaScript which compiles small pieces of code into something larger and more complex, such as a library or application. We use it for bundling the distribution module for the browser, e.g. [efficy-enterprise-api-browser-es.js](../dist/efficy-enterprise-api-browser-es.js)

Execute rollup with default config file [rollup.config.js](rollup.config.js)

```powershell
rollup -c
```

## Usage of jsDoc

With jsDoc, we generate the documentation and tutorials you current are reading!
The jsDoc generation configuration in JSON format: [jsdoc.conf.json](jsdoc.conf.json).

For the compile, we use templates
```powershell
jsdoc --configure jsdoc.conf.json --template ./node_modules/ink-docstrap/template
```


## Generate typings

We create [.d.ts Files from.js files](https://www.typescriptlang.org/docs/handbook/declaration-files/dts-from-js.html), this set up means you can own the editor experience of TypeScript-powered editors without porting your project to TypeScript, or having to maintain .d.ts files in your codebase. TypeScript supports most JSDoc tags.

This command uses [tsconfig.json](../tsconfig.json)

```powershell
npx -p typescript tsc
```

## Publish package to npm

A package manager for JavaScript, included with Node.js

1. Login to https://www.npmjs.com/
2. In your local terminal, execute `npm adduser` to setup a one-time password (OTP) with your npmjs credentials. The OTP is sent by e-mail.
3. Execute `npm publish`

This development is npm package is named [efficy-enterprise-api](https://www.npmjs.com/package/efficy-enterprise-api)

Install
```powershell
npm i efficy-enterprise-api
```

To publish updates, first increment the version, e.g.
```powershell
npm version 1.0.1
```

Commit git changes and npm publish
```powershell
npm publish
```