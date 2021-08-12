const {
  createInterface
} = require('readline')
const {
  readdirSync
} = require('fs')
const {
  readJSHELP
} = require('./jshlp')


initializeFiles = function () {
  let helpList = readdirSync('./helptopics/', ['utf8', false], function (err, files) {
    if (err) {
      process.stdout.write(err.toString())
    };
    return files
  })
  let helpListTMP = []

  for (let i = 0; i < helpList.length; i++) {
    filename = helpList[i].split('.')
    if (filename[1] === 'jshlp') {
      helpListTMP.push(filename[0])
    }
  }
  helpList = helpListTMP
  return helpList
}

const takeInput = function (filenames) {
  helpList = filenames
  input = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  })
  process.stdout.write('\nWelcome to Javascript \033[32;1;4mDiG\033[0m\'s offline help!\nHere\'s a list of topics, write a topic name(case sensitive) to view it.\n\n')
  process.stdout.write(helpList.toString().split(',').join('\n') + '\n')

  input.on('line', function (line) {
    helpIndex = helpList.indexOf(line)
    if (helpIndex > -1) {
      process.stdout.write('\033[H\033[J')
      process.stdout.write(readJSHELP(helpList[helpIndex]) + '\n\n')
    }
  })
}
exports.enterHelp = function () {
  initialized = initializeFiles()
  takeInput(initialized)
}
