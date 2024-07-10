const { spawn } = require("child_process");
const npmLog = require("npmlog");

function init(projectDir) {
  npmLog.info("初始化git仓库");
  return new Promise((resolve) => {
    const eslintInit = spawn("git", ["init"], {
      cwd: projectDir,
      stdio: "inherit",
    });
    // 使用stdio: inherit后，子进程调用error来监听error事件
    eslintInit.on("error", (e) => {
      process.exit(1);
    });
    eslintInit.on("exit", (e) => {
      npmLog.success("完成git仓库初始化!");
      resolve(e);
    });
  });
}

module.exports = init;
