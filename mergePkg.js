const mergeOptions = require('merge-options');

function mergePkg(origin, ...args) {
  const merged = mergeOptions(origin, ...args);
  return merged;
}

exports.mergePkg = mergePkg;
