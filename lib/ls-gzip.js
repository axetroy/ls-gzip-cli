/**
 * Created by axetroy on 17-3-28.
 */
const process = require('process');
const path = require('path');
const fs = require('fs');

const program = require('caporal');
const getGzipSize = require('gzip-size');
const figures = require('figures');
const chalk = require('chalk');
const prettyBytes = require('pretty-bytes');
require('console.table');

const pkg = require(path.join(__dirname, '../package.json'));
const cwd = process.cwd();

function errorHandler(err) {
  if (err) {
    console.error(err);
  }
  process.exit(1);
}

process.on('unhandledRejection', errorHandler);

process.on('uncaughtException', errorHandler);

process.on('warning', (warning) => {
  console.warn(warning.name);    // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack);   // Print the stack trace
});

function printAsTable(list) {
  console.table(list);
}

function displayFileGzip(absFilePath) {
  const raw = fs.readFileSync(absFilePath, {encoding: 'utf8'});
  const relativeFilePath = path.relative(cwd, absFilePath);
  const sourceSize = prettyBytes(Buffer.byteLength(raw, 'utf8'));
  const gzipSize = prettyBytes(getGzipSize.sync(raw));
  return {
    File: chalk.yellow(relativeFilePath),
    Source: chalk.red(sourceSize),
    Gzip: chalk.green(gzipSize)
  };
}

function displayCurrentDirFilesGzip(absDir) {
  const files = fs.readdirSync(absDir);
  const result = [];
  while (files.length) {
    let file = files.shift();
    const absFilePath = path.join(absDir, file);
    let stat = fs.statSync(absFilePath);
    if (stat.isFile()) {
      result.push(displayFileGzip(absFilePath));
    }
  }
  return result;
}

program
  .version(pkg.version)
  .description(pkg.description);

program
  .argument('[path]', 'Specify a path to display the gzip size, it can be a dir or a file.', /.*/, './')
  .action(function (argv, options) {
    let list = [];

    const absPath = path.join(cwd, argv.path);

    const stat = fs.statSync(absPath);

    if (stat.isFile()) {
      let result = displayFileGzip(absPath);
      list.push(result);
    }
    else if (stat.isDirectory()) {
      list = displayCurrentDirFilesGzip(absPath) || [];
    }

    list.length && printAsTable(list);
  });

program.parse(process.argv);