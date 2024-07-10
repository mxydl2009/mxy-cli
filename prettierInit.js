const npmLog = require("npmlog");
const fse = require("fs-extra");
const path = require("path");
const { spawn } = require("child_process");

function init(isEslint, projectDir) {
  npmLog.info("初始化prettier配置");
  const config = {
    trailingComma: "none",
    useTabs: true,
    tabWidth: 2,
    semi: true,
    singleQuote: true,
    bracketSpacing: true,
  };
  // 将eslint的配置改写一下
  if (isEslint) {
    // 获取eslint配置
    let eslintConfig = fse.readFileSync(
      path.resolve(projectDir, "./eslint.config.mjs"),
      {
        encoding: "utf-8",
      }
    );
    const prettierImport = "import prettier from 'eslint-plugin-prettier'";
    const prettierPluginConfig = `
    {
      plugins: {
        prettier: prettier
      }
    }
    `;
    const index = eslintConfig.indexOf("export default");
    eslintConfig =
      eslintConfig.slice(0, index) +
      "\n" +
      prettierImport +
      "\n" +
      eslintConfig.slice(index);
    const position = eslintConfig.indexOf("];");
    eslintConfig =
      eslintConfig.slice(0, position) +
      prettierPluginConfig +
      eslintConfig.slice(position);

    fse.writeFileSync(
      path.resolve(projectDir, "./eslint.config.mjs"),
      eslintConfig
    );
  }
  fse.ensureFileSync(path.resolve(projectDir, "./.prettierrc"));
  // 将prettier的配置写入文件
  fse.writeFileSync(
    path.resolve(projectDir, "./.prettierrc"),
    JSON.stringify(config, null, 2)
  );

  return new Promise((resolve) => {
    const prettierPlugin = spawn(
      "npm",
      ["install", "eslint-plugin-prettier", "eslint-config-prettier", "-D"],
      {
        cwd: projectDir,
        stdio: "inherit",
      }
    );
    // 使用stdio: inherit后，子进程调用error来监听error事件
    prettierPlugin.on("error", (e) => {
      process.exit(1);
    });
    prettierPlugin.on("exit", (e) => {
      npmLog.success("完成prettier配置!");
      resolve(e);
    });
  });
}

module.exports = init;
