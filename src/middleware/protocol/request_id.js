'use strict';


const uuidv4 = require('uuid/v4');

const { getServerInfo } = require('../../info');


// Assigns unique ID (UUIDv4) to each request
// Available in:
//  - input, as `requestId`
//  - logs, as `requestId`
//  - JSL parameters, as `$REQUEST_ID`
//  - response headers, as `X-Request-Id`
// Also send response headers for `X-Server-Name` and `X-Server-Id`
const setRequestIds = function ({ serverOpts }) {
  return async function setRequestId(input) {
    const { jsl, log, specific, protocolHandler } = input;
    const perf = log.perf.start('protocol.setRequestId', 'middleware');

    const requestId = uuidv4();
    const newJsl = jsl.add({ $REQUEST_ID: requestId });
    log.add({ requestId });

    Object.assign(input, { requestId, jsl: newJsl });

    sendRequestIdHeader({ specific, requestId, protocolHandler });
    sendServerIdsHeaders({ specific, serverOpts, protocolHandler });

    perf.stop();
    const response = await this.next(input);
    return response;
  };
};

// Send e.g. HTTP request header, `X-Request-Id`
const sendRequestIdHeader = function ({
  specific,
  requestId,
  protocolHandler,
}) {
  const headers = { 'X-Request-Id': requestId };
  protocolHandler.sendHeaders({ specific, headers });
};

// Send e.g. HTTP request header, `X-Server-Name` and `X-Server-Id`
const sendServerIdsHeaders = function ({
  specific,
  serverOpts,
  protocolHandler,
}) {
  const { serverId, serverName } = getServerInfo({ serverOpts });
  const headers = { 'X-Server-Name': serverName, 'X-Server-Id': serverId };
  protocolHandler.sendHeaders({ specific, headers });
};


module.exports = {
  setRequestIds,
};