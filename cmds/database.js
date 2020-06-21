exports.command = 'database <command>'
exports.desc = 'Create or edit database'
exports.builder = function (yargs) {
  return yargs.commandDir('database')
}
exports.handler = function (argv) {}
