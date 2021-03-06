'use strict';

const { pick, omit } = require('../../../utilities');
const { isType } = require('../../../content_types');
const { getParams, reduceParams } = require('../../../functions');

// Add response's metadata
const addMetadata = function ({
  response,
  response: { type, content },
  metadata,
  mInput,
}) {
  if (isType(type, 'error')) {
    return getErrorMetadata({ response, metadata, mInput });
  }

  if (isType(type, 'model')) {
    return { ...response, content: { data: content, metadata } };
  }

  return response;
};

const getErrorMetadata = function ({
  response,
  response: { type, content },
  metadata,
  mInput,
}) {
  if (!isType(type, 'error')) { return metadata; }

  const metadataA = pick(metadata, ERROR_METADATA);

  const params = getParams(mInput, { client: true });
  const paramsA = omit(params, HIDDEN_ERROR_INFO);
  const paramsB = reduceParams({ params: paramsA });

  const metadataB = { ...metadataA, info: paramsB };

  return { ...response, content: { error: content, metadata: metadataB } };
};

// Some metadata only make sense in success responses, e.g. pagination
const ERROR_METADATA = [
  'requestid',
  'duration',
];

// Parameters not allowed in error response
const HIDDEN_ERROR_INFO = [
  // Avoid duplicate information
  ...ERROR_METADATA,
  'metadata',

  // For security reasons
  'serverinfo',
];

module.exports = {
  addMetadata,
};
