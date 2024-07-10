const { spawn } = require("child_process");
const npmLog = require("npmlog");
const fse = require("fs-extra");
const path = require("path");

function init(projectDir) {
  npmLog.info("初始化commitlint配置");

  const commitLintConfig = `module.exports = {
    extends: ['@commitlint/config-conventional']
  };`;
  const commitLintConfigFilePath = path.resolve(
    projectDir,
    "./.commitlintrc.js"
  );
  fse.ensureFileSync(commitLintConfigFilePath);
  fse.writeFileSync(commitLintConfigFilePath, commitLintConfig);
  return new Promise((resolve) => {
    const commitLint = spawn(
      "npm",
      ["install", "@commitlint/cli", "@commitlint/config-conventional", "-D"],
      {
        cwd: projectDir,
        stdio: "inherit",
      }
    );
    // 使用stdio: inherit后，子进程调用error来监听error事件
    commitLint.on("error", (e) => {
      process.exit(1);
    });
    commitLint.on("exit", (e) => {
      npmLog.success("完成commitlint配置!");
      resolve(e);
    });
  });
}

module.exports = init;
