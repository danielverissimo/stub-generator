const Configstore = require('configstore')
const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const util = require('../lib/util')
const files = require('../lib/files')
const inquirer = require('../lib/inquirer')
const database = require('../lib/databases/database')

let config

exports.command = 'generate [output]'
exports.desc = 'Generate stub files'
exports.builder = {
  dir: {
    default: '.'
  }
}
exports.handler = function (argv) {
  if (!files.directoryExists(argv.output)) {
    console.log(chalk.red("\nOutput path don't exist!\n"))
    return
  }

  config = new Configstore('gen-config')

  // List all databases from config store
  const databaseList = []
  util.getDatabaseList().forEach(element => {
    databaseList.push(`${element.id} - ${element.name} (${element.type})`)
  })

  if (databaseList.length === 0) {
    console.log(
      chalk.red('\nNo database found! Please create database first!\n')
    )
    console.log(
      chalk.white('Create database example: ') +
        chalk.yellow(' gen database new\n')
    )
  } else {
    inquirer.chooseSourceType().then(response => {
      if (response.source_type === 'database') {
        // Choose witch database will be used
        inquirer.chooseDatabaseConfig(databaseList).then(selection => {
          const databaseConfig = util.getDatabaseConfig(selection.database)

          // Connect to database
          database.connect(databaseConfig).then(() => {
            // List database tables
            database.listTables(databaseConfig).then(tables => {
              // Choose database table
              inquirer.chooseDatabaseTable(tables).then(schemaTable => {
                const schemaTableArray = schemaTable.table.split('.')
                const schema = schemaTableArray[0]
                const table = schemaTableArray[1]

                // Get the table information data
                database
                  .getTableData(databaseConfig, schema, table)
                  .then(tableData => {
                    exports.listTemplateFiles(argv.output, table, tableData)
                  })
              })
            })
          })
        })
      } else {
        //
        inquirer.getSourceDataPath().then(response => {
          const path = response.source_dir_path
          if (!files.isFile(path)) {
            inquirer.getSourceData(response.source_dir_path).then(response => {
              const entity = files.getShortFileName(response.source_path)
              files.readFile(response.source_path).then(data => {
                try {
                  exports.listTemplateFiles(
                    argv.output,
                    entity,
                    JSON.parse(data)
                  )
                } catch (err) {
                  util.printError(
                    '\nError to convert datasource file to JSON.\n'
                  )
                }
              })
            })
          } else {
            const entity = files.getShortFileName(path)
            files.readFile(path).then(data => {
              try {
                exports.listTemplateFiles(argv.output, entity, JSON.parse(data))
              } catch (err) {
                util.printError('\nError to convert datasource file to JSON.\n')
              }
            })
          }
        })
      }
    })
  }
}

exports.listTemplateFiles = function (output, entity, entityData) {
  // List all template dirs base on template-path config
  files.listFiles(config.get('template-path')).then(templatesDir => {
    console.log('templatesDir...')

    if (templatesDir && templatesDir.length > 0) {
      inquirer.chooseTemplate(templatesDir).then(data => {
        // List all template files inside template dir selected
        const templatePath = config.get('template-path') + '/' + data.template

        files.listFiles(templatePath, '.js').then(files => {
          files.forEach(file => {
            // Dinamically call template js file
            const filePath = templatePath + '/' + file
            const jsFile = require(filePath)
            try {
              jsFile.run(__dirname, templatePath, output, entity, entityData) // Execute js file run function
            } catch (err) {
              console.log(
                chalk.red(
                  `\nCannot call run function on ${file}\nCause: \n${err}`
                )
              )
            }
          })
        })
      })
    } else {
      console.log(
        'No templates folder found, please create new templates or configure the template path correctly!'
      )
    }
  })
}
