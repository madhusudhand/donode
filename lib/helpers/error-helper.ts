const chalk = require('chalk');

class ErrorHelper {

  /*
  **       on: ERROR
  **
  **  log error to the console
  **  and exit the process
  **
  **  valid values
  **    - string  -> direct error message
  **    - an object
  **        {
  **          error: string,
  **          line : string or [ of strings ],
  **          file : string,
  **          hint : string or [ of strings ]
  **        }
  */
  throwError(err: any): void {
    if (typeof err === 'string') {
      console.log(chalk.bold.red('ERROR: ') + chalk.red(err));
      this._exit();
    }

    // log error
    if (err.error) console.log(chalk.bold.red('ERROR: ') + chalk.red(err.error));

    // log the error line information
    if (err.line) {
      if (Array.isArray(err.line)) {
        err.line = err.line.join('\n       ');
      }
      console.log(chalk.red('       ') + chalk.red(err.line));
    }

    // log the error file information
    if (err.file)  console.log(chalk.bold('FILE:  ') + err.file);

    // log the error correction information
    if (err.hint) {
      if (Array.isArray(err.hint)) {
        err.hint = err.hint.join('\n       ');
      }
      console.log(chalk.bold('HINT:  ') + err.hint);
    }
    this._exit();
  }



  /*
  **       on: WARNING
  **
  **  log warning to the console
  **  and do not exit the process
  **
  **  valid values
  **    - string  -> direct warning message
  **    - an object
  **        {
  **          warning: string,
  **          line   : string or [ of strings ],
  **          file   : string,
  **          hint   : string or [ of strings ]
  **        }
  */
  throwWarning(wrn: any): void {
    if (typeof wrn === 'string') {
      console.log(chalk.bold.yellow('WARNING: ') + chalk.yellow(wrn));
    }

    // log the warning
    if (wrn.warning) console.log(chalk.bold.yellow('WARNING: ') + chalk.yellow(wrn.warning));

    // log the warning line information
    if (wrn.line) {
      if (Array.isArray(wrn.line)) {
        wrn.line = wrn.line.join('\n       ');
      }
      console.log(chalk.yellow('       ') + chalk.yellow(wrn.line));
    }

    // log the warning file information
    if (wrn.file)  console.log(chalk.bold('FILE:  ') + wrn.file);

    // log the warning correction information
    if (wrn.hint) {
      if (Array.isArray(wrn.hint)) {
        wrn.hint = wrn.hint.join('\n       ');
      }
      console.log(chalk.bold('HINT:  ') + wrn.hint);
    }
    console.log();
  }



  /*
  **  PRIVATE
  */
  _exit(): void {
    console.log();
    process.exit();
  }
}

// singleton
export const errorHelper = new ErrorHelper();
