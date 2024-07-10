const { spawn } = require("child_process");
const npmLog = require("npmlog");
const fse = require("fs-extra");
const path = require("path");

function init(projectDir, pkgFilePath) {
  npmLog.info("初始化husky配置");

  const huskyConfig = {
    hooks: {
      "pre-commit": "pnpm run lint",
    },
  };
  const createdPkg = require(pkgFilePath);
  createdPkg.husky = huskyConfig;
  fse.writeFileSync(pkgFilePath, JSON.stringify(createdPkg, null, 2));
  return new Promise((resolve) => {
    const commitLint = spawn("npm", ["install", "husky", "lint-staged", "-D"], {
      cwd: projectDir,
      stdio: "inherit",
    });
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
