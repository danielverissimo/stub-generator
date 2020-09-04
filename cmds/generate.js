const Configstore = require('configstore')
const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const path = require('path')
const util = require('../lib/util')
const replace = require('../lib/replace')
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
  if (!files.pathExists(argv.output)) {
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
                    exports.listTemplateFiles(
                      argv.output,
                      table,
                      tableData,
                      response.source_type
                    )
                  })
              })
            })
          })
        })
      } else {
        //
        inquirer.getSourceDataPath().then(response => {
          const sourcePath = response.source_dir_path
          if (!files.isFile(sourcePath)) {
            inquirer.getSourceData(response.source_dir_path).then(response => {
              const entity = files.getShortFileName(response.source_path)
              files.readFile(response.source_path).then(data => {
                try {
                  exports.listTemplateFiles(
                    argv.output,
                    entity,
                    JSON.parse(data),
                    response.source_type
                  )
                } catch (err) {
                  util.printError(
                    '\nError to convert datasource file to JSON.\n'
                  )
                }
              })
            })
          } else {
            const entity = files.getShortFileName(sourcePath)
            files.readFile(sourcePath).then(data => {
              try {
                exports.listTemplateFiles(
                  argv.output,
                  entity,
                  JSON.parse(data),
                  response.source_type
                )
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

exports.listTemplateFiles = function (
  outputTargetPath,
  entityName,
  entityDataList,
  sourceType
) {
  // List all template dirs base on template-path config
  files.listFiles(config.get('template-path')).then(templatesDir => {
    if (templatesDir && templatesDir.length > 0) {
      inquirer.chooseTemplate(templatesDir).then(data => {
        // List all template files inside template dir selected
        const templatePath = config.get('template-path') + '/' + data.template

        let fileArray = []
        fileArray = files.listRecursiveFiles(templatePath, '.stub', fileArray)
        fileArray.forEach(filePath => {
          // Dinamically call template js file
          const file = files.getFileName(filePath)
          const internalPath = filePath.replace(`/${file}`, '')
          let stubPath = ''
          if (internalPath !== file) {
            stubPath = path.join(templatePath, internalPath, file)
          } else {
            stubPath = path.join(templatePath, file)
          }

          const fileArray = file.split('.')
          if (sourceType === 'file' && fileArray.length !== 3) {
            util.printError(
              `Incorrect file (${file}) name: Ex: file.{extension}.stub`
            )
          } else {
            let jfFileName = ''
            if (internalPath !== file) {
              jfFileName = path.join(internalPath, fileArray[0]) + '.js'
            } else {
              jfFileName = `${fileArray[0]}.js`
            }
            const targetName = `${fileArray[0]}.${fileArray[1]}`
            const filePath = path.join(templatePath, jfFileName)

            let jsFile = null
            try {
              jsFile = require(filePath)
            } catch (err) {}

            // Replace all template content based on source data
            replace
              .replaceAllData(
                templatePath,
                stubPath,
                internalPath !== file ? internalPath : '',
                outputTargetPath,
                targetName,
                entityName,
                entityDataList
              )
              .then(result => {
                if (result && jsFile !== null) {
                  try {
                    jsFile.run(
                      __dirname,
                      templatePath,
                      internalPath !== file ? internalPath : '',
                      targetName,
                      outputTargetPath,
                      entityName,
                      entityDataList
                    ) // Execute js file run function
                  } catch (err) {
                    console.log(
                      chalk.red(
                        `\nCannot call run function on ${file}\nCause: \n${err}`
                      )
                    )
                  }
                }
              })
          }
        })
      })
    } else {
      console.log(
        'No templates folder found, please create new templates or configure the template path correctly!'
      )
    }
  })
}
