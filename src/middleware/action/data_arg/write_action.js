'use strict';

const { mapValues, omitBy } = require('../../../utilities');
const { getModel } = require('../get_model');

const { isModelType } = require('./validate');

// Transform each `args.data` object into a separate write action
const getWriteAction = function ({
  data,
  commandpath,
  dataPaths,
  top,
  modelsMap,
  nestedKeys,
}) {
  const { modelname } = getModel({ top, modelsMap, commandpath });

  const dataA = data.map(datum => replaceNestedData({ datum, nestedKeys }));
  const args = { data: dataA };

  return { commandpath, args, modelname, dataPaths, isWrite: true };
};

// Replace nested objects from each `args.data` by only their ids
const replaceNestedData = function ({ datum, nestedKeys }) {
  const datumA = mapValues(
    datum,
    (value, key) => replaceNestedDatum({ value, key, nestedKeys }),
  );
  // Patch commands do not use ids in args.data,
  // i.e. will create undefined values
  const datumB = omitBy(datumA, value => value === undefined);
  return datumB;
};

const replaceNestedDatum = function ({ value, key, nestedKeys }) {
  if (!(nestedKeys.includes(key) && isModelType(value))) { return value; }

  return Array.isArray(value) ? value.map(({ id }) => id) : value.id;
};

module.exports = {
  getWriteAction,
};
