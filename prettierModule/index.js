const ejs = require('ejs');
const fse = require('fs-extra');
const path = require('path');

function prettierInit(userConfig, projectDir) {
  if (!userConfig.prettier) return;
  // 将.prettierrc文件移动
  const projectPrettierConfigFilePath = path.join(projectDir, './.prettierrc');
  fse.ensureFileSync(projectPrettierConfigFilePath);
  fse.copyFileSync(
    path.join(__dirname, './template/.prettierrc'),
    projectPrettierConfigFilePath,
  );

  // 返回prettier相关的package.json的片段，方便后续进行package.json的merge
  const pkgFragmentTemplate = fse.readFileSync(
    path.join(__dirname, '/template/package.json.ejs'),
    {
      encoding: 'utf-8',
    },
  );
  const pkgFragmentContent = ejs.render(pkgFragmentTemplate, {
    userConfig,
  });
  const prettierPkgFragment = JSON.parse(pkgFragmentContent);
  return prettierPkgFragment;
}

exports.init = prettierInit;
