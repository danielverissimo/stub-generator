const files = require('./files')
const chalk = require('chalk')
const pluralize = require('pluralize')
const {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  headerCase,
  noCase,
  paramCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase
} = require('change-case')
const { upperCaseFirst } = require('upper-case-first')
const { titleCase } = require('title-case')
const { swapCase } = require('swap-case')
const { lowerCase, localeLowerCase } = require('lower-case')
const { upperCase, localeUpperCase } = require('upper-case')
const pretty = require('pretty')
const Configstore = require('configstore')

module.exports = {
  replaceAllData: (
    stubFilePath,
    outputTargetPath,
    targetName,
    entity,
    entityData
  ) => {
    // Read stub file path
    files.readFile(stubFilePath).then(data => {
      // Data replacement
      const strCases = module.exports.generateAllCases(entity)
      const strCasesSingular = module.exports.generateAllCases(
        module.exports.toSingular(entity)
      )

      for (const [key, value] of Object.entries(strCases)) {
        data = module.exports.replaceAll(data, `{entity:${key}}`, value)
      }

      for (const [key, value] of Object.entries(strCasesSingular)) {
        data = module.exports.replaceAll(
          data,
          `{entity:${key},singular}`,
          value
        )
      }

      // Write file
      const outputDir = `${outputTargetPath}/${entity}`
      files.createDir(outputDir)
      const writeFile = files.writeToPath(outputDir)
      writeFile(targetName, data)

      module.exports.printSuccess(`${targetName} created.`)
    })
  },
  generateAllCases: str => {
    let strCases = {}
    strCases.camelCase = camelCase(str)
    strCases.capitalCase = capitalCase(str)
    strCases.constantCase = constantCase(str)
    strCases.dotCase = dotCase(str)
    strCases.headerCase = headerCase(str)
    strCases.noCase = noCase(str)
    strCases.paramCase = paramCase(str)
    strCases.pascalCase = pascalCase(str)
    strCases.pathCase = pathCase(str)
    strCases.sentenceCase = sentenceCase(str)
    strCases.snakeCase = snakeCase(str)
    strCases.upperCaseFirst = upperCaseFirst(str)
    strCases.titleCase = titleCase(str)
    strCases.swapCase = swapCase(str)
    strCases.lowerCase = lowerCase(str)
    strCases.localeLowerCase = localeLowerCase(str, 'en')
    strCases.upperCase = upperCase(str)
    strCases.localeUpperCase = localeUpperCase(str, 'en')
    return strCases
  },
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
