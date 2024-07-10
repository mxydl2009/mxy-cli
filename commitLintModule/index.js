const ejs = require('ejs');
const fse = require('fs-extra');
const path = require('path');

function commitLintInit(userConfig, projectDir) {
  if (!userConfig.commitlint) return;
  // 将配置文件移动
  const projectCommitLintConfigFilePath = path.join(
    projectDir,
    './.commitlintrc.js',
  );
  fse.ensureFileSync(projectCommitLintConfigFilePath);
  fse.copyFileSync(
    path.join(__dirname, './template/.commitlintrc.js'),
    projectCommitLintConfigFilePath,
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
  const commitlintPkgFragment = JSON.parse(pkgFragmentContent);
  return commitlintPkgFragment;
}

exports.init = commitLintInit;
