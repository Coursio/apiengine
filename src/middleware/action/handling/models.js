'use strict';

const { throwError } = require('../../../error');
const { getActionConstant } = require('../../../constants');

const { getModel } = require('./utilities');

// Add `action.actionConstant` and `action.modelName`
const parseModels = function ({ actions, top, modelsMap }) {
  const actionsA = actions
    .map(action => parseAction({ action, top, modelsMap }));
  return { actions: actionsA };
};

const parseAction = function ({ action, top, modelsMap }) {
  const parser = action.actionPath.length === 1
    ? parseTopLevelAction
    : parseNestedAction;
  return parser({ action, top, modelsMap });
};

// Parse a top-level action name into tokens.
// E.g. `findMyModels` -> { actionType: 'find', modelName: 'my_models' }
const parseTopLevelAction = function ({
  action,
  top: { actionConstant, modelName },
}) {
  return { ...action, actionConstant, modelName };
};

const parseNestedAction = function ({
  action,
  action: { actionPath },
  top,
  modelsMap,
}) {
  const model = getModel({ modelsMap, top, actionPath });

  if (!model) {
    const message = `Attribute '${actionPath.join('.')}' is unknown`;
    throwError(message, { reason: 'INPUT_VALIDATION' });
  }

  const { modelName, isArray } = model;

  const actionConstant = getActionConstant({ actionType: 'find', isArray });

  return { ...action, actionConstant, modelName };
};

module.exports = {
  parseModels,
};
