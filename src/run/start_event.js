'use strict';

const { emitEvent } = require('../events');
const { mapValues, omit } = require('../utilities');

// Create event when all protocol-specific servers have started
const emitStartEvent = async function ({ servers, runOpts }) {
  const message = 'Server is ready';
  const info = getPayload({ servers, runOpts });
  const startPayload = await emitEvent({
    type: 'start',
    phase: 'startup',
    message,
    info,
    runOpts,
    async: false,
  });
  return { startPayload };
};

// Remove some properties from event payload as they are not serializable,
// or should not be made immutable
const getPayload = function ({ servers, runOpts }) {
  const serversA = mapValues(servers, serverInfo => omit(serverInfo, 'server'));
  const runOptsA = omit(runOpts, 'idl');
  return { servers: serversA, options: runOptsA };
};

module.exports = {
  emitStartEvent,
};