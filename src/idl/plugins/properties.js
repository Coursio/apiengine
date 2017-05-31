'use strict';


const { mapValues, uniq, intersection, difference } = require('lodash');
const { toSentence } = require('underscore.string');
const pluralize = require('pluralize');

const { EngineError } = require('../../error');


// Generic plugin factory
// It adds properties to each model, using `getProperties(pluginOpts)` option
// which returns the properties
// It also add required properties to each model, using
// `requiredProperties` option
const propertiesPlugin = function ({
  getProperties = () => ({}),
  requiredProperties = [],
}) {
  return ({ idl, opts }) => {
    const { models } = idl;
    if (!models) { return idl; }

    const properties = getProperties(opts);

    idl.models = mapValues(models, (model, modelName) => {
      const modelProperties = model.properties || {};
      const propNames = Object.keys(modelProperties);
      const newPropNames = Object.keys(properties);

      // Make sure plugin does not override user-defined properties
      const alreadyDefinedProps = intersection(propNames, newPropNames);
      if (alreadyDefinedProps.length > 0) {
        const propMessage = getPropMessage(alreadyDefinedProps);
        const message = `In model ${modelName}, cannot override ${propMessage}`;
        throw new EngineError(message, { reason: 'IDL_VALIDATION' });
      }

      // Make sure plugin required properties exist
      const missingRequiredProps = difference(
        requiredProperties,
        [...propNames, ...newPropNames]
      );
      if (missingRequiredProps.length > 0) {
        const propMessage = getPropMessage(missingRequiredProps);
        const message = `In model ${modelName}, ${propMessage} should exist`;
        throw new EngineError(message, { reason: 'IDL_VALIDATION' });
      }

      // Modifies models
      const newModel = Object.assign(model, {
        properties: Object.assign(modelProperties, properties),
        required: uniq([...(model.required || []), ...requiredProperties]),
      });

      return newModel;
    });
    return idl;
  };
};

// Returns human-friendly version of properties, e.g. 'property my_prop' or
// 'properties my_prop and my_other_prop'
const getPropMessage = function (properties) {
  const propsName = pluralize('properties', properties.length);
  const propsValue = toSentence(properties);
  return `${propsName} ${propsValue}`;
};


module.exports = {
  propertiesPlugin,
};
