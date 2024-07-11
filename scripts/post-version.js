// npm version成功后执行
// 1. 更新了version后，将package.json的更改commit;
// 2. 推送tags;
// 3. publish package;
const { spawn } = require('child_process');
const simpleGit = require('simple-git');
const git = simpleGit();

async function postVersion() {
  const status = await git.status();
  console.log(status);
}

postVersion();
