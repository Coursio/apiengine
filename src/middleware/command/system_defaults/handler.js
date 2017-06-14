'use strict';


const { merge } = require('lodash');

const { assignObject } = require('../../../utilities');
const { defaults } = require('./defaults');


// Apply system-defined defaults to input, including input arguments
const systemDefaults = function ({ serverOpts }) {
  return async function systemDefaults(input) {
    const { log } = input;
    const perf = log.perf.start('command.systemDefaults', 'middleware');

    const newInput = getDefaultArgs({ serverOpts, input });
    merge(input, newInput);

    perf.stop();
    const response = await this.next(input);
    return response;
  };
};

// Retrieve default arguments
const getDefaultArgs = function ({ serverOpts, input }) {
  const { command } = input;
  // Iterate through every possible default value
  return Object.entries(defaults)
    .map(([name, defaultsValue]) => {
      defaultsValue = Object.entries(defaultsValue)
        // Whitelist by command.name
        .filter(([, { commandNames }]) => {
          return !commandNames || commandNames.includes(command.name);
        })
        // Whitelist by tests
        .filter(([, { test }]) => !test || test({ serverOpts, input }))
        // Only if user has not specified that argument
        .filter(([attrName]) => input[name][attrName] === undefined)
        // Reduce to a single object
        .map(([attrName, { value }]) => {
          const val = typeof value === 'function'
            ? value({ serverOpts, input })
            : value;
          return { [attrName]: val };
        })
        .reduce(assignObject, {});
      return { [name]: defaultsValue };
    })
    .reduce(assignObject, {});
};


module.exports = {
  systemDefaults,
};
