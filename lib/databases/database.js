const postgres = require('./postgres')
const util = require('../../lib/util')

module.exports = {
  connect: config => {
    switch (config.type) {
      case 'postgres':
        return postgres.connect(config)
      case 'mysql':
        break
      default:
        util.printUsage()
    }
  },
  listTables: config => {
    switch (config.type) {
      case 'postgres':
        return postgres.listTables()
      case 'mysql':
        break
      default:
        util.printUsage()
    }
  },
  getTableData: (config, schema, table) => {
    switch (config.type) {
      case 'postgres':
        return postgres.getTableData(schema, table)
      case 'mysql':
        break
      default:
        util.printUsage()
    }
  }
}
