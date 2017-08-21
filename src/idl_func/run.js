'use strict';

const { addErrorHandler } = require('../error');

const { bindHelpers } = require('./helpers');

// Process (already compiled) IDL function, i.e. fires it and returns its value
const runIdlFunc = function ({ ifv, ifv: { params }, idlFunc }) {
  // If this is not IDL function, returns as is
  if (typeof idlFunc !== 'function') { return idlFunc; }

  bindHelpers({ ifv });

  return idlFunc(params);
};

const eRunIdlFunc = addErrorHandler(runIdlFunc, {
  message: ({ idlFunc }) =>
    `IDL function failed: '${stringifyIdlFunc({ idlFunc })}'`,
  reason: 'UTILITY_ERROR',
});

const stringifyIdlFunc = function ({ idlFunc, idlFunc: { inlineFunc, name } }) {
  if (inlineFunc) { return inlineFunc; }

  if (!name || name === 'anonymous') { return idlFunc.toString(); }

  return `${name}()`;
};

module.exports = {
  runIdlFunc: eRunIdlFunc,
};