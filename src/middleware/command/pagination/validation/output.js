'use strict';

const { throwError, addErrorHandler } = require('../../../../error');
const { fastValidate } = require('../../../../fast_validation');
const { getPaginationInfo } = require('../info');
const { decode } = require('../encoding');

const { nextPageTests, getTokenTest } = require('./tests');

// Validate response.metadata related to pagination
const validatePaginationOutput = function ({
  args,
  maxPageSize,
  response,
  response: { metadata },
}) {
  const metadataA = getOutputMetadata({ metadata });
  metadataA.forEach(validateMetadatum.bind(null, { maxPageSize }));

  validateBatchSize({ args, response });
};

// Returns response.metadata related to pagination, after decoding token
const getOutputMetadata = function ({ metadata }) {
  return metadata.map(getOutputMetadatum);
};

const getOutputMetadatum = function ({ pages, pages: { token } }) {
  if (token === undefined || token === '') { return pages; }

  const tokenA = eDecode({ token });
  return { ...pages, token: tokenA };
};

const eDecode = addErrorHandler(decode, {
  message: 'Wrong response: \'token\' is invalid',
  reason: 'OUTPUT_VALIDATION',
});

const validateMetadatum = function ({ maxPageSize }, metadatum) {
  const tests = getTests();

  fastValidate({
    prefix: 'Wrong pagination response: ',
    reason: 'OUTPUT_VALIDATION',
    tests,
  }, {
    ...metadatum,
    maxPageSize,
  });
};

const getTests = function () {
  const tokenTest = getTokenTest('token');

  return [
    ...nextPageTests,
    ...tokenTest,
  ];
};

const validateBatchSize = function ({
  args,
  args: { pageSize },
  response: { data },
}) {
  const { usedPageSize } = getPaginationInfo({ args });

  if (data.length > usedPageSize) {
    const message = `Database returned pagination batch larger than specified page size ${pageSize}`;
    throwError(message, { reason: 'OUTPUT_VALIDATION' });
  }
};

module.exports = {
  validatePaginationOutput,
};