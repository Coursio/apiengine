'use strict';

const { getOptions } = require('../options');

const getRunOpts = async function ({ runOpts, measures }) {
  const { options } = await getOptions({
    instruction: 'run',
    options: runOpts,
    measures,
  });
  return { runOpts: options };
};

module.exports = {
  getRunOpts,
};