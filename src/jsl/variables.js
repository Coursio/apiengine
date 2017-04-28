'use strict';


// Values available as `$variable` in JSL
// They are uppercase to avoid name conflict with attributes
const getJslVariables = function (input = {}) {
  const { jsl: jslFunc, helpers, variables, requestInput, modelInput } = input;
  const { ip, timestamp, params } = requestInput || {};
  const { actionType, attrName, model, data, shortcut = {} } = modelInput || {};

  let vars = {};

  if (helpers) {
    Object.assign(vars, helpers);
  }

  if (variables) {
    // Instantiate variables lazily, i.e. when some JSL using them gets processed
    const usedVariables = getUsedVariables({ func: jslFunc, variables });
    const variablesParams = usedVariables
      .map(varName => {
        const variable = variables[varName];
        // Tag variable functions, so they can be lazily evaluated recursively
        if (typeof variable === 'function') {
          variable.isVariable = true;
        }
        return { [varName]: variable };
      })
      .reduce((memo, val) => Object.assign(memo, val), {});
    Object.assign(vars, variablesParams);
  }

  // Request-related variables
  if (requestInput) {
    Object.assign(vars, {
      $now: timestamp,
      $ip: ip,
      $params: params,
    });
  }

  // Model-related variables
  if (modelInput) {
    Object.assign(vars, {
      $action: actionType,
      $attrName: attrName,
      $: shortcut[attrName],
      $$: shortcut,


      // TODO: hack until we introduce custom variables
      User: { id: '1' },
    });
    if (model) {
      vars.$model = model;
    }
    if (data) {
      vars.$data = data;
    }
  }

  return vars;
};

// Find whether variables are used by a function
// At the moment, do a simplistic string search on Function.toString()
// TODO: use proper JavaScript parser instead of imperfect RegExp matching
const getUsedVariables = function ({ func, variables }) {
  const funcBody = func.toString().replace(/^[^)]+\)/, '');
  const usedVariables = Object.keys(variables).filter(variable => funcBody.indexOf(variable) !== -1);
  return usedVariables;
};



module.exports = {
  getJslVariables,
};
