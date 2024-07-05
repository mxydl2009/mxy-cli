#! /usr/bin/env node
const path = require("path");
const fse = require("fs-extra");
const importLocal = require("import-local");
const npmLog = require("npmlog");
const semver = require("semver");
const rootCheck = require("root-check");
const urlJoin = require("url-join");
const axios = require("axios");
const colors = require("colors");
const currentNodeVersion = process.version;
const { program } = require("commander");
const npminstall = require("npminstall");
const inquirer = require("inquirer");
const { spawn } = require("child_process");

const pkg = require("../package.json");

npmLog.addLevel("success", 2000, { fg: "green", bold: true }); // 添加自定义日志等级

// 注册命令
program
  .name("mxy")
  .description("a command line tool for create project")
  .version(pkg.version);

program
  .command("create")
  .description("创建JavaScript库")
  .option("--name <projectName>", "工程名")
  .option("--template <templateName>", "要使用的模板名")
  .action(commanderExec);

// 解析命令行参数，一定要在所有命令注册后，再调用
program.parse(process.argv);

execute();

async function commanderExec(options) {
  const questions = [];
  if (!options.name) {
    // 如果没有提供name，则向用户提问输入名称
    // options.name = "lib";
    questions.push({
      type: "input",
      name: "name",
      message: "please input the project name, the default is lib",
    });
  }
  if (!options.template) {
    questions.push({
      type: "list",
      name: "template",
      message: "please input the template name, the default is lib-template",
      choices: ["@mxydl2009/lib-template"],
    });
  }
  if (questions.length !== 0) {
    const answers = await inquirer.prompt(questions);
    answers.name && (options.name = answers.name);
    answers.template && (options.template = answers.template);
  }
  const cwd = process.cwd();
  const projectName = options.name || "lib";
  const templateName = options.templateName || "@mxydl2009/lib-template";
  const templateInstallTargetDir = path.resolve(cwd, ".templates");
  try {
    await Promise.resolve();
    // 创建目录
    const projectDir = path.join(cwd, projectName);
    fse.ensureDirSync(projectDir);
    // 下载模板
    await installTemplate(templateName, templateInstallTargetDir);
    // 将模板内容移动到创建的目录里
    let templateDir = path.resolve(
      templateInstallTargetDir,
      "node_modules",
      templateName
    );
    const nameSpace = templateName.startsWith("@")
      ? templateName.slice(0, templateName.indexOf("/"))
      : "";
    // 需要确保模板内容的目录非符号连接
    const stats = fse.lstatSync(templateDir);
    const isSymbolLink = stats.isSymbolicLink();
    if (isSymbolLink) {
      const realPath = await fse.readlink(templateDir);
      templateDir = path.resolve(
        templateDir,
        `${nameSpace !== "" ? ".." : "."}`,
        realPath
      );
    }
    fse.copySync(templateDir, projectDir);
    // 修改模板的名称与版本号
    const createdPkg = require(path.resolve(projectDir, "./package.json"));
    createdPkg.name = projectName;
    createdPkg.version = "1.0.0";
    const pkgFilePath = path.resolve(projectDir, "./package.json");
    // 删除npminstall安装package时在pkg.json中留下的标记字段
    Object.keys(createdPkg).forEach((key) => {
      if (key.startsWith("_") || key.startsWith("__")) {
        delete createdPkg[key];
      }
    });
    // 删除原来的pkg.json
    fse.removeSync(pkgFilePath);
    // 创建新的pkg.json
    fse.ensureFileSync(pkgFilePath);
    fse.writeFileSync(
      pkgFilePath,
      JSON.stringify(createdPkg, undefined, 2),
      "utf-8"
    );
    // 删除下载的模板文件
    fse.removeSync(templateInstallTargetDir);
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
  } catch (err) {
    npmLog.error(err.message);
  }
}

function execute() {
  if (importLocal(__filename)) {
    // importLocal(__filename)表示加载本地的包，false则包不存在本地，true则包在本地，并已经执行
    npmLog.info(`${pkg.name}`, `正在使用本地版本${pkg.version}`);
  } else {
    npmLog.info(`${pkg.name}`, `正在使用全局版本${pkg.version}`);
    try {
      checkNodeVersion();
      checkRoot();
      checkPkgVersion();
    } catch (err) {
      npmLog.error(err.message);
    }
  }
}

function checkNodeVersion() {
  const requiredCondition = pkg.engines.node;
  if (!semver.satisfies(currentNodeVersion, requiredCondition)) {
    npmLog.warn(
      `当前node版本${currentNodeVersion}不满足要求，可能会导致执行失败, 请使用${requiredCondition}的版本`
    );
  }
}

function checkRoot() {
  // 检查当前用户是否为root用户，不允许root用户启动，自动降级为501
  rootCheck();
}

/**
 * 检查npm是否有最新版本，提示用户更新
 */
async function checkPkgVersion() {
  const pkgName = pkg.name;
  let versions = await getLatestVersion(pkgName, "npm");
  if (versions) {
    // 排序versions
    versions = Object.keys(versions);
    versions = versions.filter((version) => semver.gt(version, pkg.version));
    versions = versions.sort((a, b) => {
      const dic = {
        true: 1,
        false: -1,
      };
      return dic[semver.gt(b, a)];
    });
    if (versions.length > 0) {
      // 说明有更新的版本
      npmLog.warn(
        colors.yellow(`${pkgName}有最新版本${versions[0]}, 当前版本${pkg.version}, 请手动更新
      更新命令: npm install -g ${pkgName}
      `)
      );
    }
  } else {
    npmLog.error("网络出错，请重新尝试");
  }
}

/**
 * 获取最新版本信息
 */
function getLatestVersion(pkgName, registryName = "npm") {
  const registries = {
    npm: "https://registry.npmjs.org/",
    taobao: "https://npmmirror.com/",
  };
  const registry = registries[registryName];
  return axios
    .get(urlJoin(registry, pkgName))
    .then((res) => {
      if (res.status === 200) {
        return res.data.versions;
      }
      return null;
    })
    .catch((err) => {
      throw err;
    });
}

// 安装pkgName到targetDir + node_modules目录下，如果pkgName是有命名空间的包，则命名空间也是一层目录
async function installTemplate(pkgName, targetDir) {
  await npminstall({
    root: process.cwd(),
    pkgs: [
      {
        name: pkgName,
        version: "latest",
      },
    ],
    targetDir,
  });
}
