'use strict';

// Break down '  \\( inlineFunc )  '
// into tokens: '  ', '\', '(', ' inlineFunc ', ')', '  '
const tokenizeInlineFunc = function ({ inlineFunc }) {
  return INLINE_FUNC_REGEXP.exec(inlineFunc);
};

const INLINE_FUNC_REGEXP = /^(\s*)(\\?)(\()(.*)(\))(\s*)$/;
const INLINE_FUNC_INDEX = 4;

// Remove outer parenthesis from inline function
const getInlineFunc = function ({ inlineFunc }) {
  const parts = tokenizeInlineFunc({ inlineFunc });
  return (parts && parts[INLINE_FUNC_INDEX]) || '';
};

// Retrieves inline config function body
const stringifyConfigFunc = function ({ configFunc, configFunc: { name } }) {
  if (name && name !== 'anonymous') {
    return `${name}()`;
  }

  const funcStr = configFunc.toString();
  const body = getInlineFuncBody({ funcStr });
  return body || funcStr;
};

const getInlineFuncBody = function ({ funcStr }) {
  const [, body] = BODY_REGEXP.exec(funcStr) || [];
  return body;
};

// Extracts inline function. Only works on inline functions.
const BODY_REGEXP = /^function anonymous\({(?:.|\n)+return \((.*)\)/;

module.exports = {
  tokenizeInlineFunc,
  getInlineFunc,
  stringifyConfigFunc,
};
