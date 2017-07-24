'use strict';

const { omit } = require('../../utilities');

/**
 * Removes attributes marked in IDL as `readOnly`.
 * This is done silently (i.e. does not raise warnings or errors),
 * because readonly attributes can be part of a normal response, and clients
 * should be able to send responses back as is without having to remove
 * readonly attributes.
 **/
const handleReadOnly = async function (nextFunc, input) {
  const { args, modelName, idl: { shortcuts: { readOnlyMap } } } = input;
  const { newData } = args;

  // Remove readonly attributes in `args.newData`
  if (newData) {
    const readOnlyAttrs = readOnlyMap[modelName];
    args.newData = Array.isArray(newData)
      ? newData.map(datum => removeReadOnly({
        newData: datum,
        readOnlyAttrs,
      }))
      : removeReadOnly({ newData, readOnlyAttrs });
  }

  const response = await nextFunc(input);
  return response;
};

const removeReadOnly = function ({ newData, readOnlyAttrs }) {
  return omit(newData, readOnlyAttrs);
};

module.exports = {
  handleReadOnly,
};
