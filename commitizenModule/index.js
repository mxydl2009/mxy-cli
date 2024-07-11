const ejs = require('ejs');
const fse = require('fs-extra');
const path = require('path');

function commitizenInit(userConfig) {
  if (!userConfig.commitizen) return;

  // 返回commitizen相关的package.json的片段，方便后续进行package.json的merge
  const pkgFragmentTemplate = fse.readFileSync(
    path.join(__dirname, '/template/package.json.ejs'),
    {
      encoding: 'utf-8',
    },
  );
  const pkgFragmentContent = ejs.render(pkgFragmentTemplate, {
    userConfig,
  });
  const commitizenPkgFragment = JSON.parse(pkgFragmentContent);
  return commitizenPkgFragment;
}

exports.init = commitizenInit;
