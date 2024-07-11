/**
 * @file husky and lint-staged config
 *
 */

/**
 * @module husky
 * ## 说明
 * husky v9以上推荐使用npx husky init命令初始化Husky配置，会在当前目录下生成一个.husky的目录，
 * 1. 并且会在package.json的scripts中添加prepare: husky
 * 2. .husky目录下自动生成pre-commit的文件，需要将该文件的内容改写为npx lint-staged。
 * .husky目录下还有一些husky init生成的文件，暂时不管;
 * 3. 在package.json中添加
 * ```json
 * "lint-staged": {
 *   "{要lint的目录和文件}": "eslint --{eslint的命令行参数或者指定配置文件}"
 * }
 * 4. 与commitlint结合
 * 在.husky目录下添加commit-msg文件，写入npx commitlint -e
 * ```
 */

const ejs = require('ejs');
const fse = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

function huskyInit(userConfig, projectDir) {
  if (!userConfig.husky) return;

  return new Promise((resolve) => {
    const huskyInitCMD = spawn('npx', ['husky@^9.0.11', 'init'], {
      cwd: projectDir,
      stdio: 'inherit',
    });
    process.on('error', (e) => {
      npmLog.error('husky init failed!');
      npmLog.error(e);
      process.exit(1);
    });
    // 使用stdio: inherit后，子进程调用error来监听error事件
    huskyInitCMD.on('error', (e) => {
      npmLog.error('husky init failed!');
      npmLog.error(e);
      process.exit(1);
    });
    huskyInitCMD.on('exit', (e) => {
      // 将配置脚本移动
      const projectHuskyScriptDir = path.join(projectDir, './.husky');
      fse.ensureDirSync(projectHuskyScriptDir);
      if (userConfig.eslint) {
        fse.copyFileSync(
          path.join(__dirname, './template/.husky/pre-commit'),
          path.join(projectHuskyScriptDir, './pre-commit'),
        );
      }
      if (userConfig.commitlint) {
        fse.copyFileSync(
          path.join(__dirname, './template/.husky/commit-msg'),
          path.join(projectHuskyScriptDir, './commit-msg'),
        );
      }

      // 返回Husky相关的package.json的片段，方便后续进行package.json的merge
      const pkgFragmentTemplate = fse.readFileSync(
        path.join(__dirname, '/template/package.json.ejs'),
        {
          encoding: 'utf-8',
        },
      );
      const pkgFragmentContent = ejs.render(pkgFragmentTemplate, {
        userConfig,
      });
      const huskyPkgFragment = JSON.parse(pkgFragmentContent);
      resolve(huskyPkgFragment);
    });
  });
}

exports.init = huskyInit;
