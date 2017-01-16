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
    if (err.file)  console.log(chalk.red('FILE:  ') + chalk.red(err.file));
    if (err.hint) {
      if (Array.isArray(err.hint)) {
        err.hint = err.hint.join('\n       ');
      }
      console.log(chalk.bold.green('HINT:  ') + chalk.black(err.hint));
    }
    this._exit();
  }

  _exit() {
    console.log();
    process.exit();
  }
}

// singleton
module.exports = new ErrorHelper();
