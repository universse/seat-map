const shell = require('shelljs')

const commitMessage = process.argv[3]

/*
eval `ssh-agent -s`
ssh-add ~/.ssh/personal
*/

shell.exec('yarn lint')
shell.exec('git add .')
shell.exec(`git commit -m "${commitMessage}"`)
shell.exec('git push')
