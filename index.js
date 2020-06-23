#!/usr/bin/env node

const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')

clear()

console.log(
  chalk.yellow(
    figlet.textSync(
      'Stub Gen!',
      {
        font: 'Ghost',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      },
      function (err, data) {
        if (err) {
          console.log('Something went wrong...')
          console.dir(err)
          return
        }
        console.log(data)
      }
    )
  )
)

require('yargs').commandDir('cmds').demandCommand().help().argv
