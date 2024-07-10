const ejs = require('ejs');
const fse = require('fs-extra');
const path = require('path');

function commitLintInit(userConfig, projectDir) {
  if (!userConfig.husky) return;
  // 将配置脚本移动
  const projectHuskyScriptDir = path.join(projectDir, './.husky');
  fse.ensureDirSync(projectHuskyScriptDir);
  fse.copySync(
    path.join(__dirname, './template/.husky'),
    projectHuskyScriptDir,
  );

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
  return huskyPkgFragment;
}

exports.init = commitLintInit;
