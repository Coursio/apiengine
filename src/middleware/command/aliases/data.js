'use strict';


const { omit, isEqual } = require('lodash');

const { EngineError } = require('../../../error');


// Apply `alias` in `args.data`
const applyDataAliases = function ({
  newData,
  currentData,
  attrName,
  aliases,
}) {
  return newData instanceof Array
    ? newData.map((datum, index) => applyDataAliases({
      newData: datum,
      currentData: currentData && currentData[index],
      attrName,
      aliases,
    }))
    : applyDataAlias({ newData, currentData, attrName, aliases });
};

// Copy first defined alias to main attribute,
// providing main attribute is "not defined".
// If the main attribute has the same value as the current value in the
// database, it is considered "not defined", because setting that value would
// induce no changes.
const applyDataAlias = function ({ newData, currentData, attrName, aliases }) {
  const aliasData = getAliasData({ newData, currentData, attrName, aliases });
  const data = omit(newData, aliases);

  const aliasDataKeys = Object.keys(aliasData);
  if (aliasDataKeys.length === 0) { return data; }

  const firstAttrName = aliasDataKeys[0];
  const newValue = newData[firstAttrName];

  validateAliases({ newValue, aliasData, firstAttrName });

  data[attrName] = newValue;
  return data;
};

// Retrieve subset of `args.data` that is either an alias on an aliased
// attribute, unless it is "not defined".
const getAliasData = function ({ newData, currentData, attrName, aliases }) {
  const newDataKeys = Object.keys(newData);
  return [attrName, ...aliases]
    .filter(name => newDataKeys.includes(name) &&
      (!currentData || !isEqual(newData[name], currentData[name])))
    .reduce((memo, name) => {
      memo[name] = newData[name];
      return memo;
    }, {});
};

// If the request specifies several aliases, all values must be equal
const validateAliases = function ({ newValue, aliasData, firstAttrName }) {
  const wrongAlias = Object.entries(aliasData)
    .find(([, value]) => !isEqual(value, newValue));
  if (!wrongAlias) { return; }

  const message = `'data.${firstAttrName}' and 'data.${wrongAlias[0]}' have different values ('${JSON.stringify(newValue)}' and '${JSON.stringify(wrongAlias[1])}') but must have identical values because they are aliases.`;
  throw new EngineError(message, { reason: 'INPUT_VALIDATION' });
};


module.exports = {
  applyDataAliases,
};
