'use strict';

const pluralize = require('pluralize');

const { getWordsList, intersection, mapValues } = require('../utilities');
const { throwError, addGenErrorHandler } = require('../errors');
const { compile, validate } = require('../validation');

// Generic plugin factory
// It adds attributes to each collection, using `getAttributes(pluginOpts)`
// option which returns the attributes
const attributesPlugin = function ({
  name,
  getAttributes = () => ({}),
  optsSchema,
  config: { collections },
  opts,
}) {
  if (!collections) { return; }

  validateOpts({ name, opts, optsSchema, collections });

  const newAttrs = getAttributes(opts);

  const collectionsA = applyPlugin({ collections, newAttrs });

  return { collections: collectionsA };
};

// Validate plugin options against `optsSchema`
const validateOpts = function ({ name, opts = {}, optsSchema, collections }) {
  if (optsSchema === undefined) { return; }

  const jsonSchema = getJsonSchema({ optsSchema });
  const data = getData({ collections, opts });
  const compiledJsonSchema = compile({ jsonSchema });

  eValidate({ compiledJsonSchema, data, name });
};

const getJsonSchema = function ({ optsSchema }) {
  return { type: 'object', properties: { plugin: optsSchema } };
};

const getData = function ({ collections, opts }) {
  const collTypes = Object.keys(collections);
  const data = {
    plugin: opts,
    dynamicVars: { collTypes },
  };
  return data;
};

const applyPlugin = function ({ collections, newAttrs }) {
  return mapValues(
    collections,
    (coll, collname) => mergeNewAttrs({ coll, collname, newAttrs }),
  );
};

const mergeNewAttrs = function ({
  coll,
  coll: { attributes = {} },
  collname,
  newAttrs,
}) {
  validateAttrs({ attributes, collname, newAttrs });

  const collA = { attributes: { ...attributes, ...newAttrs } };
  return { ...coll, ...collA };
};

// Make sure plugin does not override user-defined attributes
const validateAttrs = function ({ attributes, collname, newAttrs }) {
  const attrNames = Object.keys(attributes);
  const newAttrNames = Object.keys(newAttrs);
  const alreadyDefinedAttrs = intersection(attrNames, newAttrNames);
  if (alreadyDefinedAttrs.length === 0) { return; }

  // Returns human-friendly version of attributes, e.g. 'attribute my_attr' or
  // 'attributes my_attr and my_other_attr'
  const attrsName = pluralize('attributes', newAttrNames.length);
  const attrsValue = getWordsList(newAttrNames, { op: 'and', quotes: true });
  const message = `In collection '${collname}', cannot override ${attrsName} ${attrsValue}`;
  throwError(message, { reason: 'CONFIG_VALIDATION' });
};

const eValidate = addGenErrorHandler(validate, {
  reason: 'CONFIG_VALIDATION',
  message: ({ name }, { message }) =>
    `Wrong '${name}' plugin configuration: ${message}`,
});

module.exports = {
  attributesPlugin,
};
