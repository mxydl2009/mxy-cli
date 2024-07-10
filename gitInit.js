const npmLog = require('npmlog');
const { spawn } = require('child_process');
const fse = require('fs-extra');
const path = require('path');

function init(projectDir) {
  npmLog.info('初始化git仓库');
  return new Promise((resolve) => {
    const gitInit = spawn('git', ['init'], {
      cwd: projectDir,
      stdio: 'inherit',
    });
    // 使用stdio: inherit后，子进程调用error来监听error事件
    gitInit.on('error', (e) => {
      npmLog.error(e);
      process.exit(1);
    });
    gitInit.on('exit', (e) => {
      const gitIgnoreFilePath = path.join(projectDir, './.gitignore');
      fse.ensureFileSync(gitIgnoreFilePath);
      const gitIgnoreContent = `node_modules
dist
docs
.DS_Store
coverage
.nyc_output
`;
      fse.writeFileSync(gitIgnoreFilePath, gitIgnoreContent);
      npmLog.success('初始化git仓库完成!');
      resolve(e);
    });
  });
}

exports.init = init;
