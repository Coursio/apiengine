'use strict';

const { emitEvent } = require('../../events');

// If error handler fails, only reports failure then gives up
const failureHandler = async function (input) {
  const {
    error,
    protocolHandler,
    protocolHandler: { failureProtocolStatus: status },
    specific,
    runOpts,
  } = input;

  const standardError = getStandardError({ error });

  await reportError({ runOpts, error: standardError, input });

  // Make sure a response is sent, or the socket will hang
  protocolHandler.send.nothing({ specific, status });

  return standardError;
};

const getStandardError = function ({ error }) {
  const details = error.stack || error;
  return {
    type: 'ERROR_HANDLER_FAILURE',
    title: 'Error handler failed',
    description: 'Error handler failed',
    details,
  };
};

const reportError = function ({ runOpts, error, input }) {
  return emitEvent({
    input,
    type: 'failure',
    phase: 'request',
    level: 'error',
    errorInfo: error,
    runOpts,
  });
};

module.exports = {
  failureHandler,
};
