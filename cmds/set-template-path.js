const Configstore = require('configstore')
const chalk = require('chalk')
const files = require('../lib/files')

exports.command = 'set-template-path [path]'
exports.desc = 'Config template path'
exports.builder = {
  dir: {
    default: '.'
  }
}
exports.handler = function (argv) {
  const config = new Configstore('gen-config')
  if (files.pathExists(argv.path)) {
    config.set('template-path', argv.path)
  } else {
    console.log(chalk.red("\nError: Path don't exist!\n"))
  }
}
