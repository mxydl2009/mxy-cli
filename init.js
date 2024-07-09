const path = require("path");
const fse = require("fs-extra");
const npmLog = require("npmlog");
const npminstall = require("npminstall");

// 初始化，检查用户配置信息与环境信息是否有冲突, 下载模板
async function init(userConfig) {
  const cwdPath = process.cwd();
  const projectPath = path.resolve(cwdPath, userConfig.projectName);

  isExisted = fse.existsSync(projectPath);
  if (isExisted) {
    npmLog.error(`error: ${projectPath} is already existed!`);
    return;
  }
  const cwd = process.cwd();
  const projectName = userConfig.projectName;
  const templateName = userConfig.template;
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
    createdPkg.name = userConfig.packageName;
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
    return {
      pkgFilePath,
      createdPkg,
      projectDir,
    };
  } catch (err) {
    npmLog.error(err.message);
  }
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

module.exports = init;
