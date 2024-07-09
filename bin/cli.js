#! /usr/bin/env node
// const path = require("path");
// const fse = require("fs-extra");
const npmLog = require("npmlog");
const { program } = require("commander");
const fse = require("fs-extra");
const path = require("path");
const { getLicense } = require("license");
const runPrompts = require("../prompts");
const checkBase = require("../checkBase");
const init = require("../init");
const eslintInit = require("../eslintInit");
const prettierInit = require("../prettierInit");

const pkg = require("../package.json");

npmLog.addLevel("success", 2000, { fg: "green", bold: true }); // 添加自定义日志等级

let userConfig = null;
// 注册命令
program
  .name("mxy")
  .description("a command line tool for create project")
  .version(pkg.version);

program.command("create").description("创建JavaScript库").action(create);

// checkBase();

// 解析命令行参数，一定要在所有命令注册后，再调用
program.parse(process.argv);

async function create() {
  // 检查基础环境和当前cli的版本
  await checkBase();
  // 获取用户配置
  userConfig = await runPrompts();
  const { pkgFilePath, createdPkg, projectDir } = await init(userConfig);
  // const projectDir = path.resolve(process.cwd(), "./test/");
  console.log("userConfig", userConfig);
  // 生成LICENSE文件
  const license = getLicense(userConfig.license, {
    author: userConfig.author,
    year: new Date().getFullYear().toString(),
  });
  const licenseFilePath = path.resolve(projectDir, "LICENSE");
  fse.ensureFileSync(licenseFilePath);
  fse.writeFileSync(licenseFilePath, license, "utf-8");

  // eslint初始化
  await eslintInit(projectDir);
  // prettier初始化
  await prettierInit(userConfig.eslint, projectDir, pkgFilePath);
  // commitlint初始化
  // commitLint.init();
  // husky初始化
  // husky.init();
  // git初始化
  // gitRepo.init();
}
