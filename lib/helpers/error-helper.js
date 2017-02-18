'use strict';
const chalk = require('chalk');

class ErrorHelper {
  constructor() {

  }

  throwError(err) {
    if (typeof err === 'string') {
      console.log(chalk.bold.red('ERROR: ') + chalk.red(err));
      this._exit();
    }

    if (err.error) console.log(chalk.bold.red('ERROR: ') + chalk.red(err.error));
    if (err.line) {
      if (Array.isArray(err.line)) {
        err.line = err.line.join('\n       ');
      }
      console.log(chalk.red('       ') + chalk.red(err.line));
    }
    if (err.file)  console.log(chalk.bold.red('FILE:  ') + chalk.red(err.file));
    if (err.hint) {
      if (Array.isArray(err.hint)) {
        err.hint = err.hint.join('\n       ');
      }
      console.log(chalk.bold.green('HINT:  ') + err.hint);
    }
    this._exit();
  }


  throwWarning(err) {
    if (typeof err === 'string') {
      console.log(chalk.bold.yellow('WARNING: ') + chalk.yellow(err));
      this._exit();
    }

    if (err.error) console.log(chalk.bold.yellow('WARNING: ') + chalk.yellow(err.error));
    if (err.line) {
      if (Array.isArray(err.line)) {
        err.line = err.line.join('\n       ');
      }
      console.log(chalk.yellow('       ') + chalk.yellow(err.line));
    }
    if (err.file)  console.log(chalk.bold.yellow('FILE:  ') + chalk.yellow(err.file));
    if (err.hint) {
      if (Array.isArray(err.hint)) {
        err.hint = err.hint.join('\n       ');
      }
      console.log(chalk.bold.green('HINT:  ') + err.hint);
    }
    console.log();
  }

  _exit() {
    console.log();
    process.exit();
  }
}

// singleton
module.exports = new ErrorHelper();
