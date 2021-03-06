const fs = require('fs')
const path = require('path')
const { reject } = require('lodash')
const chalk = require('chalk')

module.exports = {
  readFile: writeToPath => {
    return fs.promises.readFile(writeToPath, 'utf8', function (err, data) {
      if (err) throw err
      return data
    })
  },
  readFileSync: filePath => {
    return fs.readFileSync(filePath, 'utf8', function (err, data) {
      if (err) throw err
      return data
    })
  },
  createDir: filePath => {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true })
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
  listRecursiveFiles: (
    dirPath,
    extension = null,
    arrayOfFiles,
    basePath = null
  ) => {
    basePath = basePath === null ? dirPath : basePath
    files = fs.readdirSync(dirPath)
    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
      if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
        arrayOfFiles = module.exports.listRecursiveFiles(
          path.join(dirPath, file),
          extension,
          arrayOfFiles,
          basePath
        )
      } else {
        const relativePath = dirPath.replace(`${basePath}`, '')
        arrayOfFiles.push(path.join(relativePath, file))
      }
    })

    if (extension) {
      arrayOfFiles = arrayOfFiles.filter(file => {
        return path.extname(file).toLowerCase() === extension.toLowerCase()
      })
    }

    return arrayOfFiles
  },
  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd())
  },
  pathExists: filePath => {
    return fs.existsSync(filePath)
  },
  isFile: filePath => {
    return fs.lstatSync(filePath).isFile()
  },
  getFileName: str => {
    return path.basename(str)
  },
  getShortFileName: str => {
    const filename = path.basename(str)
    return path.parse(filename).name
  },
  renameFile(oldPath, newPath) {
    fs.renameSync(oldPath, newPath)
  },
  joinPath: paths => {
    let pathStr = ''
    paths.forEach(element => {
      pathStr = path.join(pathStr, element)
    })
    return pathStr
  }
}
