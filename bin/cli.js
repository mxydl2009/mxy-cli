#! /usr/bin/env node
const npmLog = require('npmlog');
const { program } = require('commander');
const fse = require('fs-extra');
const path = require('path');
const { getLicense } = require('license');
const runPrompts = require('../prompts');
const checkBase = require('../checkBase');
const initTemplate = require('../initTemplate');
const eslintModule = require('../eslintModule/index');
const prettierModule = require('../prettierModule/index');
const commitLintModule = require('../commitLintModule/index');
const huskyModule = require('../huskyModule/index');
const npmHookModule = require('../npmHookModule/index');
const gitInit = require('../gitInit');
const installDeps = require('../installDeps');

const pkg = require('../package.json');
const { mergePkg } = require('../mergePkg');

npmLog.addLevel('success', 2000, { fg: 'green', bold: true }); // 添加自定义日志等级

let userConfig = null;
// 注册命令
program
  .name('mxy')
  .description('a command line tool for create project')
  .version(pkg.version);

program.command('create').description('创建JavaScript库').action(create);

// 解析命令行参数，一定要在所有命令注册后，再调用
program.parse(process.argv);

async function create() {
  // 检查基础环境和当前cli的版本
  await checkBase();
  // 获取用户配置
  userConfig = await runPrompts();
  const projectDir = await initTemplate.init(userConfig);
  // 生成LICENSE文件;
  const license = getLicense(userConfig.license, {
    author: userConfig.author,
    year: new Date().getFullYear().toString(),
  });
  const licenseFilePath = path.resolve(projectDir, 'LICENSE');
  fse.ensureFileSync(licenseFilePath);
  fse.writeFileSync(licenseFilePath, license, 'utf-8');

  const pkgObject = require(path.join(projectDir, './package.json'));
  const configPkg = [];
  // git初始化
  await gitInit.init(projectDir);

  if (userConfig.prettier) {
    // prettier初始化
    const prettierPkg = prettierModule.init(userConfig, projectDir);
    configPkg.push(prettierPkg);
  }

  if (userConfig.eslint) {
    // eslint初始化
    const eslintPkg = eslintModule.init(userConfig, projectDir);
    configPkg.push(eslintPkg);
  }

  if (userConfig.commitlint) {
    // commitlint初始化
    const commitlintPkg = commitLintModule.init(userConfig, projectDir);
    configPkg.push(commitlintPkg);
  }

  // 后进行Husky初始化，commitlint依赖husky的git hook来执行
  if (userConfig.husky) {
    // husky初始化
    try {
      const huskyPkg = await huskyModule.init(userConfig, projectDir);
      configPkg.push(huskyPkg);
    } catch (e) {
      console.log('husky error', e);
      process.exit(1);
    }
  }

  const npmHookPkg = npmHookModule.init(userConfig, projectDir);
  configPkg.push(npmHookPkg);

  const lastPkg = mergePkg(pkgObject, ...configPkg);

  // 将合并后的package.json写入
  fse.writeFileSync(
    path.join(projectDir, './package.json'),
    JSON.stringify(lastPkg, null, 2),
  );

  await installDeps(projectDir);

  npmLog.success(`创建${userConfig.projectName}完成!`);
}
