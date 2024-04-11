# App instructions

## Running the development app

After cloning this repo or pulling changes run:

``` sh
npm ci
```

to install the JavaScript dependencies. Then run:

``` sh
npm run extract-data
```

to extract the data from the zip file app/data.zip. Repeat this task whenever the app/data.zip file is changed.


To run the app:

``` sh
npm run start
```

This should open the app at [http://localhost:8000/](http://localhost:8000/).

## Building for Production

To build the production version of the app, run:

``` sh
npm run dist
```

The dist/ directory should now be ready for deployment to a remote server.

## Directory structure

### .husky/

This folder contains code for running pre-commit hooks. This is so we can check the JavaScript meets the linting rules before committing. If you need to skip this for some reason (e.g. you want to commit some work-in-progress), add `--no-verify` to your git instruction. e.g.:

``` sh
git commit -m "WIP" --no-verify
```

### app/

This is the development app. Inside there are folders for cascading style sheets (css/), the JSON data (data/, after running `npm run extract-data`), HTML (html/) and JavaScript. The src/ directory contains the uncompiled JavaScript. The js/ directory contains JavaScript "compiled" from the src directory (after running `npm run start`, for example). The index.html page at the top of the directory is the root page for the development app.

### dist/

The production version of the app, ready for "distribution" to a remote server. In this app the JavaScript and CSS have been minified and sit at the top level. The data files have been individually gzipped.

### node_modules/

After running `npm ci` this directory will contain all the required third-party JavaScript dependencies. You shouldn't need to edit this folder or reference it directly.

### . (root)

The root of this project contains this README and a numer of config files:
- .eslintrc.json: JavaScript linting rules
- .gitignore: patterns describing directories and files that git should ignore
- bs-config.json: configuration information for the local development server
- package-lock.json: instructions about which specific version of each third-party package the app should use. It's regenerated if you run `npm install` and referenced when running `npm ci`. You shouldn't need to edit this file directly.
- package.json: configuration for the package as a whole. This contains, among other things, various bits of metadata, shell commands to run using `npm run` and two lists of package dependencies: "devDependencies" that are used to build the app and "dependencies" that are used in the app.
- rollup.config-dist.mjs: instructions for building the "compiled" JavaScript code for the dist directory (i.e. dist/script.min.js).
- rollup.config-dist.mjs: instructions for building the "compiled" JavaScript code for the development app (i.e. app/src/script.js).

## npm scripts

The package.json file defines several shell scripts that can be run using `npm run <script-name>`. Several of them are there simply to make the other scripts shorter and can largely be ignored. The following scripts you may have/want to use directly:

- dist: Build the production version of the app.
- extract-data: extract the data from app/data.zip.
- lint: run the JavaScript linting instructions to see if there are any issues.
- lint:fix: run the JavaScript linting instructions to see if there are any issues and fix any that can be automatically fixed.
- start: build the local development app and run it on a local server .