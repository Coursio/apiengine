'use strict';

const { resolve, isAbsolute } = require('path');

const { throwError } = require('../../error');
const { mStat, findAsync } = require('../../utilities');

// Retrieves final configuration path to use
const getConf = function ({
  path,
  name,
  extNames,
  baseDir = process.cwd(),
}) {
  if (path) {
    return getDirectFile({ path, baseDir });
  }

  const fileNames = getConfFileNames({ name, extNames });
  return findConfFile({ fileNames });
};

// The path was directly specified
const getDirectFile = async function ({ path, baseDir }) {
  if (typeof path !== 'string') {
    const message = `Configuration must be a string, not '${path}'`;
    throwError(message, { reason: 'CONF_LOADING' });
  }

  // Relative paths are relative to current directory
  const pathA = isAbsolute(path) ? path : resolve(baseDir, path);
  const directPathB = await checkIsDirectory({ dir: pathA, isDir: false });
  return directPathB;
};

// Try to find api_engine.NAME.json|yml|yaml in current directory,
// or any parent
const findConfFile = async function ({ fileNames, confDir = process.cwd() }) {
  const confDirA = await checkIsDirectory({ dir: confDir, isDir: true });

  const paths = fileNames.map(fileName => resolve(confDir, fileName));
  const confFile = findAsync(paths, mStat);
  if (confFile) { return confFile; }

  const parentConfDir = resolve(confDirA, '..');
  if (parentConfDir === confDirA) { return; }

  return findConfFile({ fileNames, confDir: parentConfDir });
};

const getConfFileNames = function ({ name, extNames }) {
  return extNames.map(extName => `api_engine.${name}.${extName}`);
};

const checkIsDirectory = async function ({ dir, isDir }) {
  const confStat = await getFile(dir);

  const confIsDir = confStat.isDirectory();

  if (confIsDir && isDir === false) {
    const message = `'${dir}' must not be a directory`;
    throwError(message, { reason: 'CONF_LOADING' });
  }

  if (!confIsDir && isDir === true) {
    const message = `'${dir}' must be a directory`;
    throwError(message, { reason: 'CONF_LOADING' });
  }

  return dir;
};

const getFile = async function (file) {
  const confStat = await mStat(file);

  if (!confStat) {
    const message = `'${file}' must exist`;
    throwError(message, { reason: 'CONF_LOADING' });
  }

  return confStat;
};

module.exports = {
  getConf,
};