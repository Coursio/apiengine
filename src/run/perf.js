'use strict';

const { startPerf, stopPerf, emitPerfEvent } = require('../perf');

// Monitor startup time
const startStartupPerf = function () {
  const startupPerf = startPerf('startup');
  return { startupPerf };
};

const stopStartupPerf = function ({ startupPerf, measures }) {
  const startupPerfA = stopPerf(startupPerf);
  const measuresA = [startupPerfA, ...measures];
  return { measures: measuresA };
};

// Emit "perf" event with startup performance
const reportStartupPerf = function ({ runOpts, measures }) {
  return emitPerfEvent({ phase: 'startup', runOpts, measures });
};

module.exports = {
  startStartupPerf,
  stopStartupPerf,
  reportStartupPerf,
};