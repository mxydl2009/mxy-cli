/**
 * @file check base environment
 */
const semver = require("semver");
const rootCheck = require("root-check");
const urlJoin = require("url-join");
const axios = require("axios");
const colors = require("colors");
const importLocal = require("import-local");
const npmLog = require("npmlog");
const currentNodeVersion = process.version;

const pkg = require("./package.json");

function checkNodeVersion() {
  const requiredCondition = pkg.engines.node;
  if (!semver.satisfies(currentNodeVersion, requiredCondition)) {
    npmLog.warn(
      `当前node版本${currentNodeVersion}不满足要求，可能会导致执行失败, 请使用${requiredCondition}的版本`
    );
  }
}

function checkRoot() {
  // 检查当前用户是否为root用户，不允许root用户启动，自动降级为501
  rootCheck();
}

/**
 * 检查npm是否有最新版本，提示用户更新
 */
async function checkPkgVersion() {
  const pkgName = pkg.name;
  let versions = await getLatestVersion(pkgName, "npm");
  if (versions) {
    // 排序versions
    versions = Object.keys(versions);
    versions = versions.filter((version) => semver.gt(version, pkg.version));
    versions = versions.sort((a, b) => {
      const dic = {
        true: 1,
        false: -1,
      };
      return dic[semver.gt(b, a)];
    });
    if (versions.length > 0) {
      // 说明有更新的版本
      npmLog.warn(
        colors.yellow(`${pkgName}有最新版本${versions[0]}, 当前版本${pkg.version}, 请手动更新
      更新命令: npm install -g ${pkgName}
      `)
      );
    } else {
      npmLog.info(`${pkgName}为最新版本`);
    }
  } else {
    npmLog.error("网络出错，请重新尝试");
  }
}

/**
 * 获取最新版本信息
 */
function getLatestVersion(pkgName, registryName = "npm") {
  const registries = {
    npm: "https://registry.npmjs.org/",
    taobao: "https://npmmirror.com/",
  };
  const registry = registries[registryName];
  return axios
    .get(urlJoin(registry, pkgName))
    .then((res) => {
      if (res.status === 200) {
        return res.data.versions;
      }
      return null;
    })
    .catch((err) => {
      throw err;
    });
}

async function checkBase() {
  if (importLocal(__filename)) {
    // importLocal(__filename)表示加载本地的包，false则包不存在本地，true则包在本地，并已经执行
    npmLog.info(`${pkg.name}`, `正在使用本地版本${pkg.version}`);
  } else {
    npmLog.info(`${pkg.name}`, `正在使用全局版本${pkg.version}`);
    try {
      checkNodeVersion();
      checkRoot();
      await checkPkgVersion();
    } catch (err) {
      npmLog.error(err.message);
    }
  }
}

module.exports = checkBase;
