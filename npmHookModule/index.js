const ejs = require('ejs');
const fse = require('fs-extra');
const path = require('path');

function npmHookInit(userConfig, projectDir) {
  // 将配置文件移动
  const projectNpmHookDirPath = path.join(projectDir, './scripts');
  fse.ensureDirSync(projectNpmHookDirPath);
  fse.copySync(
    path.join(__dirname, './template/scripts'),
    projectNpmHookDirPath,
  );

  // 返回commitlint相关的package.json的片段，方便后续进行package.json的merge
  const pkgFragmentTemplate = fse.readFileSync(
    path.join(__dirname, '/template/package.json.ejs'),
    {
      encoding: 'utf-8',
    },
  );
  const pkgFragmentContent = ejs.render(pkgFragmentTemplate, {
    userConfig,
  });
  const npmHookPkgFragment = JSON.parse(pkgFragmentContent);
  return npmHookPkgFragment;
}

exports.init = npmHookInit;
