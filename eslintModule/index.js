const ejs = require('ejs');
const fse = require('fs-extra');
const path = require('path');

function eslintInit(userConfig, projectDir) {
  if (!userConfig.eslint) return;
  const eslintConfigFileTemplate = fse.readFileSync(
    path.join(__dirname, '/template/eslint.config.mjs.ejs'),
    {
      encoding: 'utf-8',
    },
  );
  const eslintConfigContent = ejs.render(eslintConfigFileTemplate, {
    userConfig,
  });
  // 将内容写入ESLint配置文件
  const projectEslintConfigFilePath = path.join(
    projectDir,
    'eslint.config.mjs',
  );
  fse.ensureFileSync(projectEslintConfigFilePath);
  fse.writeFileSync(projectEslintConfigFilePath, eslintConfigContent);

  // 将.eslintignore文件移动
  const projectEslintIgnoreFilePath = path.join(projectDir, './.eslintignore');
  fse.ensureFileSync(projectEslintIgnoreFilePath);
  fse.copyFileSync(
    path.join(__dirname, './template/.eslintignore'),
    projectEslintIgnoreFilePath,
  );

  // 返回ESLint相关的package.json的片段，方便后续进行package.json的merge
  const pkgFragmentTemplate = fse.readFileSync(
    path.join(__dirname, '/template/package.json.ejs'),
    {
      encoding: 'utf-8',
    },
  );
  const pkgFragmentContent = ejs.render(pkgFragmentTemplate, {
    userConfig,
  });
  const eslintPkgFragment = JSON.parse(pkgFragmentContent);
  return eslintPkgFragment;
}

exports.init = eslintInit;
