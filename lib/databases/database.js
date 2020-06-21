const postgres = require('./postgres')
const util = require('../../lib/util')

module.exports = {
  connect: config => {
    switch (config.type) {
      case 'postgres':
        return postgres.connect(config)
      case 'vue-component':
        break
      case 'laravel-api':
        break
      default:
        util.printUsage()
    }
  },
  listTables: config => {
    switch (config.type) {
      case 'postgres':
        return postgres.listTables()
      case 'vue-component':
        break
      case 'laravel-api':
        break
      default:
        util.printUsage()
    }
  },
  getTableData: (config, schema, table) => {
    switch (config.type) {
      case 'postgres':
        return postgres.getTableData(schema, table)
      case 'vue-component':
        break
      case 'laravel-api':
        break
      default:
        util.printUsage()
    }
  }
}
