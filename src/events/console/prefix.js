'use strict';

const { TYPES, LEVELS } = require('../constants');

// Retrieves `[TYPE] [LEVEL] [SERVER_NAME] [TIMESTAMP] [PHASE]`
const getPrefix = function ({
  type,
  phase,
  level,
  timestamp,
  requestInfo: { requestId } = {},
  serverName,
}) {
  const prefixes = [
    getType({ type }),
    getLevel({ level }),
    getServerName({ serverName }),
    getTimestamp({ timestamp }),
    getRequestId({ phase, requestId }),
  ];
  const prefix = prefixes.map(val => `[${val}]`).join(' ');
  return prefix;
};

const getType = function ({ type }) {
  return type.toUpperCase().padEnd(typesMaxLength);
};

const typesMaxLength = Math.max(...TYPES.map(type => type.length));

const getLevel = function ({ level }) {
  return level.toUpperCase().padEnd(levelsMaxLength);
};

const levelsMaxLength = Math.max(...LEVELS.map(level => level.length));

const getServerName = function ({ serverName }) {
  return serverName.substr(0, serverNameLength).padEnd(serverNameLength);
};

const serverNameLength = 12;

const getTimestamp = function ({ timestamp }) {
  return timestamp.replace('T', ' ').replace(/([0-9])Z$/, '$1');
};

// Either requestId (if phase `request`), or the phase itself
const getRequestId = function ({ phase, requestId = phase.toUpperCase() }) {
  return requestId.substr(0, requestIdLength).padEnd(requestIdLength);
};

const requestIdLength = 8;

module.exports = {
  getPrefix,
};
