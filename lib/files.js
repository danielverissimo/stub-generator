const fs = require('fs')
const path = require('path')
const { reject } = require('lodash')
const chalk = require('chalk')

module.exports = {
  readFile: path => {
    return fs.promises.readFile(path, 'utf8', function (err, data) {
      if (err) throw err
      return data
    })
  },
  createDir: path => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }
  },
  writeToPath: path => (file, content) => {
    const filePath = `${path}/${file}`

    fs.writeFile(filePath, content, err => {
      if (err) throw err
      return true
    })
  },
  listFiles: (dirPath, extension = null) => {
    return new Promise(resolve => {
      fs.readdir(dirPath, function (err, files) {
        //handling error
        if (err) {
          console.log(
            chalk.red(`\nFailure to read this directory: ${dirPath}\n`)
          )
          reject(err)
          return
        }

        if (extension) {
          files = files.filter(file => {
            return path.extname(file).toLowerCase() === extension.toLowerCase()
          })
        }
        resolve(files)
      })
    })
  },
  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd())
  },
  pathExists: filePath => {
    return fs.existsSync(filePath)
  },
  isFile: path => {
    return fs.lstatSync(path).isFile()
  },
  getFileName: str => {
    return path.basename(str)
  },
  getShortFileName: str => {
    const filename = path.basename(str)
    return path.parse(filename).name
  }
}
