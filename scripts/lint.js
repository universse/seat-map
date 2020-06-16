const shell = require('shelljs')

const packages = ['intersected.now.sh', 'lenses', 'system'].join(',')
const excluded = ['node_modules', 'dist', 'public', '.cache'].join('|')
const glob = `"packages/{${packages}}/{,!(${excluded})/**/}*.{scss,js,json}"`

shell.exec(`prettier-standard ${glob} --lint`)
