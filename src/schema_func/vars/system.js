'use strict';

const { protocolHandlers } = require('../../protocols');
const { rpcHandlers } = require('../../rpc');
const { COMMAND_TYPES } = require('../../constants');

const protocols = Object.keys(protocolHandlers);
const rpcs = Object.keys(rpcHandlers);

// System variables that are always present
// We need to specify their `type` and `isArray` for `coll.authorize`
// validation
const SYSTEM_VARS = {
  requestid: { type: 'string' },
  timestamp: { type: 'string' },
  protocol: { type: 'string', validation: { enum: protocols } },
  ip: { type: 'string' },
  origin: { type: 'string' },
  path: { type: 'string' },
  method: { type: 'string' },
  queryvars: { type: 'dynamic' },
  headers: { type: 'dynamic' },
  format: { type: 'string' },
  charset: { type: 'string' },
  compress: { type: 'string' },
  payload: { type: 'dynamic' },
  rpc: { type: 'string', validation: { enum: rpcs } },
  args: { type: 'dynamic' },
  params: { type: 'dynamic' },
  summary: { type: 'string' },
  commandpaths: { type: 'string', isArray: true },
  commandpath: { type: 'string' },
  collections: { type: 'string', isArray: true },
  collection: { type: 'string' },
  command: {
    type: 'string',
    validation: {
      enum: COMMAND_TYPES,
      // With patch authorization, one can simulate find and replace
      // authorization and vice-versa. So to avoid mistakes, we force
      // specifying them together.
      requires: [
        [['patch'], ['find']],
        [['upsert'], ['find']],
        [['create'], ['find']],
        [['delete'], ['find']],
        [['upsert'], ['create', 'patch']],
        [['create', 'patch'], ['upsert']],
      ],
    },
  },
};

// Those system variables are set after the database response
const LATER_SYSTEM_VARS = [
  'duration',
  'status',
  'responsedata',
  'responsetype',
  'metadata',
  'modelscount',
  'uniquecount',
];

const POSITIONAL_VARS = [
  'arg1',
  'arg2',
  'arg3',
  'arg4',
  'arg5',
  'arg6',
  'arg7',
  'arg8',
  'arg9',
];

// System variables that are not always present
const TEMP_SYSTEM_VARS = [
  'model',
  'value',
  'previousmodel',
  'previousvalue',
  'arg',
  'type',
];

module.exports = {
  SYSTEM_VARS,
  LATER_SYSTEM_VARS,
  POSITIONAL_VARS,
  TEMP_SYSTEM_VARS,
};
