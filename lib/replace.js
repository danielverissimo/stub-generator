const util = require('./util')
const files = require('./files')
const chalk = require('chalk')
const pluralize = require('pluralize')

const {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  headerCase,
  noCase,
  paramCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase
} = require('change-case')
const { upperCaseFirst } = require('upper-case-first')
const { titleCase } = require('title-case')
const { swapCase } = require('swap-case')
const { lowerCase, localeLowerCase } = require('lower-case')
const { upperCase, localeUpperCase } = require('upper-case')
const pretty = require('pretty')
const Configstore = require('configstore')

module.exports = {
  replaceAllData: (
    templatePath,
    stubFilePath,
    outputTargetPath,
    targetFileName,
    entity,
    entityData
  ) => {
    // Read stub file path
    files.readFile(stubFilePath).then(stubData => {
      // Data replacement
      stubData = module.exports.replaceSingleEntityData(entity, stubData)

      // Replace collection
      module.exports
        .replaceCollectionData(stubData, templatePath, entityData)
        .then(stubDataResponse => {
          // Write file
          const outputDir = `${outputTargetPath}/${entity}`
          files.createDir(outputDir)
          const writeFile = files.writeToPath(outputDir)
          writeFile(targetFileName, stubDataResponse)

          util.printSuccess(`${targetFileName} created.`)
        })
    })
  },
  replaceSingleEntityData: (entity, stubData) => {
    const strCases = module.exports.generateAllCases(entity)
    const strCasesSingular = module.exports.generateAllCases(
      util.toSingular(entity)
    )

    for (const [key, value] of Object.entries(strCases)) {
      stubData = module.exports.replaceAll(stubData, `{entity:${key}}`, value)
    }

    for (const [key, value] of Object.entries(strCasesSingular)) {
      stubData = module.exports.replaceAll(
        stubData,
        `{entity:${key},singular}`,
        value
      )
    }

    return stubData
  },
  replaceCollectionData: (stubData, templatePath, entityDataList) => {
    return new Promise(resolve => {
      const res = stubData.match(/{collection:.*}/g)

      if (res && res.length > 0) {
        res.forEach(element => {
          /*
            Ex: collection:fields,data_type
            elementOptions = ['collection:fields', 'data_type']
            item = fields
            itemType = data_type
          */

          element = module.exports.replaceAll(element, '{', '')
          element = module.exports.replaceAll(element, '}', '')
          const elementOptions = element.split(',')
          if (elementOptions[0].length <= 1) {
            console.log(chalk.red('collection name cannot be found.'))
            return
          }

          const commands = elementOptions[0].split(':')

          const name = commands[0]
          const item = commands[1]
          const itemType = elementOptions.length > 1 ? elementOptions[1] : null

          if (itemType) {
            // Iterate over all source list (database or file)
            let dataToReplace = ''
            entityDataList.forEach(entityData => {
              const dataType = util.dataType(itemType)

              const filePath = `${templatePath}/${item}/${dataType}`
              let fileData = files.readFileSync(`${filePath}.stub`)

              // If exists, execute js collection item to manipulate entityData object.
              const jsConvertFile = require(`${filePath}.js`)
              try {
                entityData = jsConvertFile.run(entityData, __dirname) // Execute js convert file run function
              } catch (err) {
                console.log(
                  chalk.red(`\nCannot call run function\nCause: \n${err}`)
                )
              }

              for (const [key, value] of Object.entries(entityData)) {
                fileData = module.exports.replaceStubData(
                  key,
                  value ? value.toString() : '',
                  fileData
                )
              }
              dataToReplace += `\t\t${fileData}`
            })

            stubData = stubData.replace(
              `{${element}}`,
              util.pretty(dataToReplace)
            )

            resolve(stubData)
          }
        })
      }
    })
  },
  replaceStubData: (entity, entityValue, stubData) => {
    const strCases = module.exports.generateAllCases(entityValue)
    const strCasesSingular = module.exports.generateAllCases(
      util.toSingular(entityValue)
    )

    for (const [key, value] of Object.entries(strCases)) {
      stubData = module.exports.replaceAll(
        stubData,
        `{${entity}:${key}}`,
        value
      )
    }

    for (const [key, value] of Object.entries(strCasesSingular)) {
      stubData = module.exports.replaceAll(
        stubData,
        `{${entity}:${key},singular}`,
        value
      )
    }

    return stubData
  },
  generateAllCases: str => {
    let strCases = {}
    strCases.camelCase = camelCase(str)
    strCases.capitalCase = capitalCase(str)
    strCases.constantCase = constantCase(str)
    strCases.dotCase = dotCase(str)
    strCases.headerCase = headerCase(str)
    strCases.noCase = noCase(str)
    strCases.paramCase = paramCase(str)
    strCases.pascalCase = pascalCase(str)
    strCases.pathCase = pathCase(str)
    strCases.sentenceCase = sentenceCase(str)
    strCases.snakeCase = snakeCase(str)
    strCases.upperCaseFirst = upperCaseFirst(str)
    strCases.titleCase = titleCase(str)
    strCases.swapCase = swapCase(str)
    strCases.lowerCase = lowerCase(str)
    strCases.localeLowerCase = localeLowerCase(str, 'en')
    strCases.upperCase = upperCase(str)
    strCases.localeUpperCase = localeUpperCase(str, 'en')
    return strCases
  },
  replaceAll: (string, search, replace) => {
    return string.split(search).join(replace)
  }
}
