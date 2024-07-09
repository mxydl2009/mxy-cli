const { spawn } = require("child_process");
const npmLog = require("npmlog");

function init(projectDir) {
  npmLog.info("初始化eslint配置");
  // 进入工程中，安装依赖
  // try {
  //   const eslintInit = spawnSync("npm", ["init", "@eslint/config@latest"], {
  //     cwd: projectDir,
  //     stdio: "inherit",
  //   });
  // } catch (e) {
  //   process.exit(1);
  // }
  return new Promise((resolve) => {
    const eslintInit = spawn("npm", ["init", "@eslint/config@latest"], {
      cwd: projectDir,
      stdio: "inherit",
    });
    // 使用stdio: inherit后，子进程调用error来监听error事件
    eslintInit.on("error", (e) => {
      process.exit(1);
    });
    eslintInit.on("exit", (e) => {
      npmLog.success("完成eslint配置!");
      resolve(e);
    });
  });
}

module.exports = init;
