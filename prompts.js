/**
 * @file 用户交互，获取用户配置信息
 */

const inquirer = require("inquirer");
// 验证npm包名是否满足npm的规则
const validate = require("validate-npm-package-name");
const { isEmail } = require("validator");

async function runPrompts() {
  const questions = [
    {
      type: "input",
      name: "projectName",
      message: "project name(default is myLib):",
      default: "myLib",
      validate: (val) => {
        if (!val) {
          return "please input the project name";
        }
        if (val.match(/\s+/g)) {
          // 名字不能是连续的空白字符
          return "Forbidden project name";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "packageName",
      message: "package name(default is lib):",
      default: "lib",
      validate: (val) => {
        if (!validate(val).validForNewPackages) {
          // 不满足创建新包的命名规则
          return "Forbidden package name!";
        }
        return true;
      },
    },
    {
      type: "list",
      name: "template",
      message: "choose template:",
      choices: ["@mxydl2009/lib-template", "none"],
    },
    {
      type: "list",
      name: "license",
      message: "choose license:",
      choices: ["MIT", "GPL-2.0+", "LGPL-2.0+", "BSD-2-Clause", "Apache-2.0"],
    },
    // 是否初始化git
    {
      type: "confirm",
      name: "git",
      message: "init git?",
      default: true,
    },
    {
      type: "input",
      name: "author",
      message: "author email",
      default: "mxydl2009@163.com",
      validate: (val) => {
        if (!isEmail(val)) {
          return "Forbidden email address!";
        }
        return true;
      },
    },
    {
      type: "confirm",
      name: "prettier",
      message: "use prettier?",
      default: true,
    },
    {
      type: "confirm",
      name: "eslint",
      message: "use eslint?",
      default: true,
    },
    {
      type: "checkbox",
      name: "commitlint",
      message: "use commitlint:",
      choices: ["commitlint", "standard-version"],
      default: ["commitlint"],
      filter: (values) => {
        return values.reduce(
          (res, cur) => ({
            ...res,
            [cur]: true,
          }),
          {}
        );
      },
    },
    {
      type: "confirm",
      name: "husky",
      message: "use husky?",
      default: true,
    },
    {
      type: "list",
      name: "ci",
      message: "use ci:",
      choices: ["github", "circleci", "travis", "none"],
      filter: (value) => {
        return {
          github: "github",
          circleci: "circleci",
          travis: "travis",
          none: null,
        }[value];
      },
    },
  ];
  const answers = await inquirer.prompt(questions);
  return answers;
}

module.exports = runPrompts;