const util = require('../../lib/util')
const { Client } = require('pg')
const CLI = require('clui')
const Spinner = CLI.Spinner

let client

module.exports = {
  connect: config => {
    const status = new Spinner('Wait for the database connecting...')
    status.start()

    client = new Client({
      user: config.username,
      host: config.host,
      database: config.database,
      password: config.password,
      port: config.port
    })

    return client
      .connect()
      .then(res => {
        console.log('Database connection successfully!')
      })
      .catch(err => {
        console.error(
          ` Cannot connect to database ${config.name} (${config.type})\n`
        )
      })
      .finally(() => {
        status.stop()
      })
  },
  listTables: () => {
    const status = new Spinner('Reading database catalog...')
    status.start()

    const query = `
    SELECT * FROM pg_catalog.pg_tables
    WHERE schemaname != 'pg_catalog'
    AND schemaname != 'information_schema';
    `
    return new Promise((resolve, reject) => {
      client.query(query, (err, res) => {
        if (err) {
          console.error(err)
          reject(err)
          return
        }

        resolve(res.rows)
        status.stop()
      })
    })
  },
  getTableData: (schema, table) => {
    const status = new Spinner('Reading table data...')
    status.start()

    const query = `
    SELECT * FROM information_schema.columns
    WHERE table_schema = '${schema}'
    AND table_name   = '${table}';
    `
    return new Promise((resolve, reject) => {
      client.query(query, (err, res) => {
        if (err) {
          console.error(err)
          reject(err)
          return
        }

        res.rows.forEach(data => {
          data['data_type_formmated'] = util.dataType(data.data_type)
        })

        resolve(res.rows)

        client.end()
        status.stop()
      })
    })
  }
}
