'use strict';

const { dirname } = require('path');

const { addErrorHandler } = require('../error');
const { reduceAsync, get, set, findValueAsync } = require('../utilities');

const { getConfFile } = require('./conf');

// Load options being a path pointing to a config file, inside the main
// config file, i.e. to a 'sub-conf' file
const loadSubConf = async function ({
  instruction,
  options,
  mainConfPath,
  availableOpts,
}) {
  const subConfOpts = getSubConfOpts({ availableOpts });
  const baseDir = getBaseDir({ mainConfPath });
  const optionsB = await loadSubConfOpts({
    instruction,
    baseDir,
    subConfOpts,
    options,
  });

  return { options: optionsB };
};

const getSubConfOpts = function ({ availableOpts }) {
  return availableOpts
    .filter(({ subConfFiles }) => subConfFiles !== undefined);
};

// Config paths, inside a main config files, are relative to that file
const getBaseDir = function ({ mainConfPath }) {
  if (!mainConfPath) { return; }

  return dirname(mainConfPath);
};

const loadSubConfOpts = function ({
  instruction,
  baseDir,
  subConfOpts,
  options,
}) {
  return reduceAsync(
    subConfOpts,
    (optionsA, subConfOpt) =>
      eLoadSubConfOpt({ instruction, baseDir, options: optionsA, subConfOpt }),
    options,
  );
};

const loadSubConfOpt = async function ({
  instruction,
  baseDir,
  options,
  subConfOpt: { name, subConfFiles },
}) {
  const keys = name.split('.');
  const path = get(options, keys);

  const content = await loadSubConfFiles({
    instruction,
    baseDir,
    path,
    subConfFiles,
  });

  const optionsA = set(options, keys, () => content);
  return optionsA;
};

const eLoadSubConfOpt = addErrorHandler(loadSubConfOpt, {
  message: ({ subConfOpt: { name } }) => `Could not load option '${name}'`,
  reason: 'CONF_LOADING',
});

const loadSubConfFiles = function ({
  instruction,
  baseDir,
  path,
  subConfFiles,
}) {
  return findValueAsync(
    subConfFiles,
    subConfFile => loadSubConfFile({ instruction, baseDir, path, subConfFile }),
  );
};

const loadSubConfFile = async function ({
  instruction,
  baseDir,
  path,
  subConfFile: { filename, extNames, loader },
}) {
  const { content } = await getConfFile({
    path,
    name: `${instruction}.${filename}`,
    baseDir,
    extNames,
    loader,
  });
  return content;
};

module.exports = {
  loadSubConf,
};