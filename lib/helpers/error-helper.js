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

    console.log(chalk.bold.red('ERROR: ') + chalk.red(err.error));
    console.log(chalk.red('       ') + chalk.red(err.line));
    console.log(chalk.red('FILE:  ') + chalk.red(err.file));
    console.log(chalk.bold.green('HINT:  ') + chalk.black(err.hint));
    this._exit();
  }

  _exit() {
    console.log();
    process.exit();
  }
}

// singleton
module.exports = new ErrorHelper();
