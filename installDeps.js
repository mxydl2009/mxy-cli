const npmLog = require("npmlog");
const { spawn } = require("child_process");

function installDeps(projectDir) {
  npmLog.info("installing dependencies, please waiting...");
  // 进入工程中，安装依赖
  const installDependencies = spawn("npm", ["install"], {
    cwd: path.resolve(cwd, projectDir),
    stdio: "inherit",
  });
  // 使用stdio: inherit后，子进程调用error来监听error事件
  installDependencies.on("error", (e) => {
    process.exit(1);
  });
  installDependencies.on("exit", (e) => {
    npmLog.success("dependencies installed successfully!");
  });
}

module.exports = installDeps;
