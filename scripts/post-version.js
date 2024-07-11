// npm version成功后执行
// 1. 更新了version后，将package.json的更改commit;
// 2. 推送tags;
// 3. publish package;
const { spawn } = require('child_process');
const simpleGit = require('simple-git');
const git = simpleGit();
const npmLog = require('npmlog');
const ora = require('ora');

npmLog.addLevel('success', 2000, { fg: 'green', bold: true }); // 添加自定义日志等级

async function postVersion() {
  const status = await git.status();
  if (status.modified.length > 2) {
    npmLog.error(
      'modified files not only package.json and lock file!',
      status.modified,
    );
    process.exit(1);
  }
  const spinner = ora();
  spinner.start('开始git提交、推送');
  await git.add('.');

  // 提交更改
  const message = 'ci: bump version';
  await git.commit(message);

  // 推送到远程仓库
  await git.push('origin', 'main');

  // 推送标签到远程仓库
  await git.pushTags('origin');

  spinner.succeed('git提交、推送完成');

  return new Promise((resolve) => {
    const spinner = ora();
    spinner.start('npm publish begin...');
    const publishment = spawn('npm', ['publish'], {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
    process.on('error', (e) => {
      npmLog.error('npm publish failed!');
      npmLog.error(e);
      process.exit(1);
    });
    // 使用stdio: inherit后，子进程调用error来监听error事件
    publishment.on('error', (e) => {
      npmLog.error('npm publish failed!');
      npmLog.error(e);
      process.exit(1);
    });
    publishment.on('exit', (e) => {
      spinner.succeed('npm publish successfully!');
      resolve(e);
    });
  });
}

postVersion();
