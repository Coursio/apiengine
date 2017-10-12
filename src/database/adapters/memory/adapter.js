'use strict';

const { connect } = require('./connect');
const { disconnect } = require('./disconnect');
const { commands } = require('./wrap');
const opts = require('./opts');

// Memory database adapter, i.e. keeps database in-memory
const adapter = {
  type: 'memory',
  title: 'In-Memory',
  description: 'In-memory database. For development purpose only.',
  kinds: ['data', 'search'],
  connect,
  disconnect,
  ...commands,
  opts,
};

module.exports = adapter;