const Configstore = require('configstore')
const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const util = require('../../lib/util')
const files = require('../../lib/files')
const inquirer = require('../../lib/inquirer')
const database = require('../../lib/databases/database')

exports.command = 'new'
exports.desc = 'Add new database config'
exports.builder = {}
exports.handler = function (argv) {
  const config = new Configstore('gen-config')
  const databases = config.get('databases')

  // Choose database type to create
  inquirer.chooseDatabaseType().then(response => {
    inquirer.configDatabase(response.database_type).then(data => {
      // Get the database config from store
      let databases = config.get('databases')
      if (!databases) {
        databases = []
      }
      data.type = response.database_type
      data.id = databases.length + 1
      if (!databases) {
        databases = []
        databases[0] = data
      } else {
        databases[databases.length] = data
      }

      // Set database config to store
      config.set('databases', databases)
    })
  })
}
