'use strict';

const { defaultsDeep } = require('lodash');

// Default value for main options
const applyDefaultOptions = function (serverOpts) {
  const serverOptsA = defaultsDeep(serverOpts, defaultOptions);
  return serverOptsA;
};

const defaultOptions = {
  maxDataLength: 1000,
  defaultPageSize: 100,
  maxPageSize: 100,
  logLevel: 'info',
  logFilter: {
    payload: ['id'],
    response: ['id'],
    argData: ['id'],
    actionResponses: ['id'],
    headers: [],
    queryVars: [],
    params: [],
    settings: [],
  },
  http: {
    enabled: true,
    host: 'localhost',
    port: 80,
  },
};

module.exports = {
  applyDefaultOptions,
};
