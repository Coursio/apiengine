'use strict';

const { evalAuthorize } = require('./eval');
const { addAuthorizeFilter } = require('./filter');
const { checkNewData } = require('./data');

// Handles `schema.authorize` and `collection.authorize`
const validateAuthorization = function ({
  args,
  collname,
  clientCollname,
  schema,
  schema: { collections },
  serverVars,
  mInput,
  command,
  top,
  top: { command: { type: topCommand } },
}) {
  // `create`'s currentData query
  if (topCommand === 'create' && command === 'find') { return; }

  validateSchemaAuth({ clientCollname, schema, serverVars, mInput, top });

  const coll = collections[collname];
  const argsA = validateCollAuth({
    args,
    coll,
    collname,
    clientCollname,
    schema,
    serverVars,
    mInput,
    command,
    top,
  });

  return { args: argsA };
};

// Handles `schema.authorize`
const validateSchemaAuth = function ({
  clientCollname,
  schema,
  schema: { authorize },
  serverVars,
  mInput,
  top,
}) {
  if (authorize === undefined) { return; }

  evalAuthorize({
    clientCollname,
    authorize,
    top,
    serverVars,
    schema,
    mInput,
  });
};

// Handles `collection.authorize`
const validateCollAuth = function ({
  args,
  coll: { authorize },
  collname,
  clientCollname,
  schema,
  serverVars,
  mInput,
  command,
  top,
}) {
  if (authorize === undefined) { return args; }

  const authorizeA = evalAuthorize({
    collname,
    clientCollname,
    authorize,
    top,
    serverVars,
    schema,
    mInput,
  });
  if (authorizeA === true) { return args; }

  const argsA = addAuthorizeFilter({ command, authorize: authorizeA, args });

  checkNewData({ authorize: authorizeA, args, clientCollname, top });

  return argsA;
};

module.exports = {
  validateAuthorization,
};
