'use strict';

const { applyAllDefault } = require('./apply');

// Applies schema property `default`, if value is undefined
// This can be a static value or any schema function
// Not applied on partial write commands like 'patch'
const userDefaults = function ({
  args,
  args: { newData },
  modelName,
  schema: { shortcuts: { userDefaultsMap } },
  mInput,
}) {
  if (newData === undefined) { return; }

  const defAttributes = userDefaultsMap[modelName];
  const newDataA = applyAllDefault({ data: newData, defAttributes, mInput });

  return { args: { ...args, newData: newDataA } };
};

module.exports = {
  userDefaults,
};
