const chalk = require('chalk')
const pluralize = require('pluralize')
const { camelCase, pascalCase } = require('change-case')
const { upperCaseFirst } = require('upper-case-first')
const { titleCase } = require('title-case')
const pretty = require('pretty')
const Configstore = require('configstore')

module.exports = {
  printUsage: path => {
    console.log(
      'Usage: gen <command> [options] \n\n' +
        'Options:' +
        '\n  new \t\t\t Create a new database' +
        '\n  edit \t\t\t edit an existent database \n' +
        '\nCommands:' +
        '\n  database [options]' +
        '\n  vue-crud' +
        '\n  vue-component' +
        '\n  laravel-api'
    )
  },
  printSuccess: message => {
    console.log(chalk.green(message))
  },
  printError: message => {
    console.log(chalk.red(message))
  },
  getDatabaseList: () => {
    const config = new Configstore('gen-config')
    const databases = config.get('databases')
    return databases ? databases : []
  },
  getDatabaseConfigById: id => {
    const config = new Configstore('database')
    const databases = config.get('databases')
    if (databases) {
      for (let index = 0; index < databases.length; index++) {
        const element = databases[index]
        if (+element.id == +id) return element
      }
    }
    return null
  },
  getDatabaseConfig: promptSelection => {
    const id = promptSelection.split(' ')[0]
    const database = module.exports.getDatabaseConfigById(id)
    return database
  },
  replaceAll: (string, search, replace) => {
    return string.split(search).join(replace)
  },
  toSingular: str => {
    return pluralize.singular(str)
  },
  upperCaseFirst: str => {
    return upperCaseFirst(str)
  },
  toPascalCase: str => {
    return pascalCase(str)
  },
  toTitleCase: str => {
    str = module.exports.replaceAll(str, '_', ' ')
    return titleCase(str)
  },
  dataType: data_type => {
    switch (data_type) {
      case 'character varying':
        return 'input'
        break
      case 'boolean':
        return 'boolean'
        break
      case 'timestamp without time zone':
        return 'timestamp'
        break
      case 'integer':
        return 'integer'
        break
      default:
        return 'input'
    }
  },
  pretty: str => {
    return pretty(str, { ocd: true })
  }
}
