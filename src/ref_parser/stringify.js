'use strict';

const { isAbsolute, relative } = require('path');

const refSym = Symbol('ref');

// When resolving a JSON reference to a JavaScript file, keep the reference
// as `obj[refSym]`, so it can be serialized back to it
const addJsonRefSym = function ({ obj, url, rootDir }) {
  const isConstant = !obj || !['object', 'function'].includes(typeof obj);
  if (isConstant) { return obj; }

  // Node.js modules won't be absolute, i.e. kept as is.
  // Normal JavaScript files are converted to absolute file by the parser.
  // We convert to path relative to root file, i.e. serialized file must be
  // in same directory as root file
  const ref = isAbsolute(url) ? relative(rootDir, url) : url;
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  obj[refSym] = ref;

  return obj;
};

// Stringify an object with previous JSON references, and restore them first.
const stringifyWithJsonRefs = function (obj) {
  return JSON.stringify(obj, stringify);
};

const stringify = function (key, val) {
  const jsonRef = val && val[refSym];
  if (!jsonRef) { return val; }

  return { $ref: jsonRef };
};

module.exports = {
  addJsonRefSym,
  stringifyWithJsonRefs,
};