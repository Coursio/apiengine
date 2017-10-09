'use strict';

const { addGenErrorHandler } = require('../../../error');
const { compile } = require('../../../json_validation');
const { compileIdlFuncs } = require('../../../idl_func');

// Validates that `attr.validate` are valid JSON schema
// by compiling them with AJV
const validateJsonSchema = function ({
  idl,
  idl: { shortcuts: { validateMap } },
}) {
  const idlA = compileIdlFuncs({ idl });
  compile({ jsonSchema: validateMap, idl: idlA });

  return idl;
};

const eValidateJsonSchema = addGenErrorHandler(validateJsonSchema, {
  message: 'Invalid JSON schema in \'validate\' property',
  reason: 'IDL_VALIDATION',
});

module.exports = {
  validateJsonSchema: eValidateJsonSchema,
};
