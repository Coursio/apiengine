'use strict';

const { getStandardError } = require('../../error');
const { monitor } = require('../../perf');
const { emitEvent } = require('../../events');

// Add events and monitoring capabilities to the function
const wrapCloseFunc = function (func, { successMessage, errorMessage, label }) {
  const eFunc = handleEvent(func, { successMessage, errorMessage });

  const getLabel = getEventLabel.bind(null, label);
  const mFunc = monitor(eFunc, getLabel, 'main');
  return mFunc;
};

const getEventLabel = function (label, { protocol }) {
  return `${protocol}.${label}`;
};

// Shutdown failures events
const handleEvent = function (func, { successMessage, errorMessage }) {
  return async function errorHandler (input) {
    const { protocol, runOpts } = input;

    try {
      const response = await func(input);
      const message = typeof successMessage === 'function'
        ? successMessage(response)
        : successMessage;
      const messageA = `${protocol} - ${message}`;
      await emitEvent({
        type: 'message',
        phase: 'shutdown',
        message: messageA,
        runOpts,
      });
      return response;
    } catch (error) {
      const errorInfo = getStandardError({ error });
      const message = `${protocol} - ${errorMessage}`;
      await emitEvent({
        type: 'failure',
        phase: 'shutdown',
        message,
        errorInfo,
        runOpts,
      });
    }
  };
};

module.exports = {
  wrapCloseFunc,
};