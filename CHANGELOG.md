# 变更日志

## 1.1.0 / 2024.7.10

- 添加eslint、prettier、typescript、commitlint、husky等选项的支持;
- 完善创建库的基本流程;
- 目前仅仅支持对所有选项选择yes的情况(除了typescript的选择);

## 1.1.1 / 2024.7.10

- 删除git init的提问，作为流程中必须有的，否则husky无法初始化;
- husky初始化中，根据ESLint是否选择，更改对lint-stage的配置;

## 1.2.2 / 2024.7.11

- 添加commitizen选项的支持;
- 添加post-version脚本，支持`npm version`后续操作自动执行;
