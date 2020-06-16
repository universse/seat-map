const shell = require('shelljs')

shell.exec('lerna clean --yes')
shell.exec('rm -rf yarn.lock')
