'use strict';

const { emitEvent } = require('../../events');

// Main "call" event middleware.
// Each request creates exactly one "call" event, whether successful or not
const callEvent = async function ({
  runOpts,
  schema,
  level,
  mInput,
  error,
  respPerf: { duration } = {},
}) {
  await emitEvent({
    mInput,
    type: 'call',
    phase: 'request',
    level,
    vars: { error },
    runOpts,
    schema,
    duration,
  });
};

module.exports = {
  callEvent,
};
