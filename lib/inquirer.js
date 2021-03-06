const inquirer = require('inquirer')
const files = require('./files')
const { isInteger } = require('lodash')
const util = require('./util')
const _ = require('underscore')
const { filter } = require('underscore')

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))
inquirer.registerPrompt(
  'file-tree-selection',
  require('inquirer-file-tree-selection-prompt')
)

const sourceTypeList = ['database', 'file']
const databaseList = ['postgres', 'mysql']

module.exports = {
  chooseSourceType: () => {
    const QUESTIONS = [
      {
        name: 'source_type',
        type: 'list',
        message: 'Source type:',
        choices: sourceTypeList,
        validate: function (value) {
          if (value.length) {
            return true
          } else {
            return 'Please select source type.'
          }
        }
      }
    ]

    return inquirer.prompt(QUESTIONS)
  },
  getSourceDataPath: () => {
    const QUESTIONS = [
      {
        name: 'source_dir_path',
        type: 'input',
        message: 'Source directory path:',
        validate: function (value) {
          if (value.length) {
            return true
          } else {
            return 'Please inform source directory path.'
          }
        }
      }
    ]

    return inquirer.prompt(QUESTIONS)
  },
  getSourceData: dataPath => {
    const QUESTIONS = [
      {
        name: 'source_path',
        type: 'fuzzypath',
        message: 'Source data file:',
        depthLimit: 10,
        rootPath: dataPath
      }
    ]

    return inquirer.prompt(QUESTIONS)
  },
  chooseDatabaseType: () => {
    const QUESTIONS = [
      {
        name: 'database_type',
        type: 'list',
        message: 'Database type',
        choices: databaseList
      }
    ]

    return inquirer.prompt(QUESTIONS)
  },
  chooseDatabaseConfig: databases => {
    const QUESTIONS = [
      {
        name: 'database',
        type: 'list',
        message: 'Select database:',
        choices: databases
      }
    ]

    return inquirer.prompt(QUESTIONS)
  },
  chooseDatabaseTable: tables => {
    let tableList = []
    tables.forEach(element => {
      tableList.push(`${element.schemaname}.${element.tablename}`)
    })
    const QUESTIONS = [
      {
        name: 'table',
        type: 'autocomplete',
        message: 'Select table:',
        choices: tableList,
        source: (answers, input) => {
          let list = []
          if (input === '' || input === undefined) {
            list = tableList
          } else {
            list = tableList.filter(element => {
              return element.startsWith(input)
            })
          }

          return new Promise(resolve => {
            resolve(list)
          })
        }
      }
    ]

    return inquirer.prompt(QUESTIONS)
  },
  configDatabase: databaseType => {
    const questions = [
      {
        name: 'name',
        type: 'input',
        message: 'Database Name:',
        validate: function (value) {
          if (value.length) {
            return true
          } else {
            return 'Please enter the database name.'
          }
        }
      },
      {
        name: 'host',
        type: 'input',
        message: 'Database host:',
        validate: function (value) {
          if (value.length) {
            return true
          } else {
            return 'Please enter the database host.'
          }
        }
      },
      {
        name: 'port',
        type: 'input',
        message: 'Database port:',
        validate: function (value) {
          if (value.length === 0) {
            return 'Please enter the database port.'
          }
          if (isNaN(value)) {
            return 'Please enter the database port number.'
          } else {
            return true
          }
        }
      },
      {
        name: 'username',
        type: 'input',
        message: 'Database username:',
        validate: function (value) {
          if (value.length) {
            return true
          } else {
            return 'Please enter database username.'
          }
        }
      },
      {
        name: 'password',
        type: 'password',
        message: 'Database password:',
        validate: function (value) {
          if (value.length) {
            return true
          } else {
            return 'Please enter database password.'
          }
        }
      }
    ]
    return inquirer.prompt(questions)
  },
  chooseTemplate: templateList => {
    const QUESTIONS = [
      {
        name: 'template',
        type: 'autocomplete',
        message: 'Select template folder:',
        choices: templateList,
        source: (answers, input) => {
          let list = []
          if (input === '' || input === undefined) {
            list = templateList
          } else {
            list = templateList.filter(element => {
              return element.startsWith(input)
            })
          }

          return new Promise(resolve => {
            resolve(list)
          })
        }
      }
    ]

    return inquirer.prompt(QUESTIONS)
  }
}
