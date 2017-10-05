'use strict';

const { assignObject } = require('../../../utilities');

const maps = require('./maps');
const { mapModels } = require('./helper');

// Compile-time transformations just meant for runtime performance optimization
const normalizeShortcuts = function ({ idl }) {
  const shortcuts = Object.entries(maps)
    .map(([name, input]) => {
      const shortcut = mapModels({ idl }, input);
      return { [name]: shortcut };
    })
    .reduce(assignObject, {});
  return { ...idl, shortcuts };
};

module.exports = {
  normalizeShortcuts,
};