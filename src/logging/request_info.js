'use strict';

const { cloneDeep } = require('lodash');

const { omit } = require('../utilities');

// Builds `requestInfo` object, which contains request-related log information:
//   - requestId {string}
//   - timestamp {string}
//   - requestTime {number} - time it took to handle the request, in millisecs.
//     Only defined if the request was successful.
//   - ip {string}
//   - protocol {string} - e.g. HTTP
//   - protocolFullName {string} - e.g. HTTP/1.1
//   - url {string} - full URL
//   - origin {string} - protocol + host + port
//   - path {string} - only the URL path, with no query string nor hash
//   - route {string} - internal route picked according to the URL,
//     among `GraphQL`, `GraphiQL` and `GraphQLPrint`
//   - method {string} - protocol-specific method, e.g. GET
//   - goal {string} - like method, but protocol-agnostic, e.g. `find`
//   - protocolStatus {string} - protocol-specific status, e.g. HTTP status code
//   - status {string} - protocol-agnostic status, among 'INTERNALS', 'SUCCESS',
//     'CLIENT_ERROR' and 'SERVER_ERROR'
//   - pathVars {object} - URL variables, as a hash table
//   - params {object} - Parameters, as a hash table.
//   - settings {object} - Settings, as a hash table.
//   - queryVars {object} - Query variables, as a hash table
//   - headers {object} - protocol headers (e.g. HTTP headers), as a hash table
//   - payload {any} - request payload
//   - operation {string} - operation, among `GraphQL`, `GraphiQL` and
//     `GraphQLPrint`
//   - actions {object} - represented all actions fired
//      - ACTION_PATH {key} - action full path, e.g. 'findModel.findSubmodel'
//         - model {string} - model name
//         - args {object} - action arguments, e.g. filter or sort argument
//         - responses {object[]}
//            - content {object|object[]} - action response (model or
//              collection)
//   - response {object}
//      - content {string} - full response raw content
//      - type {string} - among 'model', 'collection', 'error', 'object',
//        'html', 'text'
//   - phase {string} - 'request', 'startup', 'shutdown' or 'process'
//   - error {string} - error reason
// Each of those fields is optional, i.e. might not be present.
// Remove some properties of log which could be of big size, specifically:
//   - queryVars, headers, params, settings:
//      - apply server option loggerFilter.queryVars|headers|params|settings,
//        which is either a simple mapping function or a list of attribute
//        names.
//        It defaults to returning an empty object.
//   - payload, actions.ACTION_PATH.args.data,
//     actions.ACTION_PATH.responses.content, response.content:
//      - apply server option loggerFilter.payload|argData|actionResponses|
//        response, which is either a simple mapping function or a list of
//        attribute names. It is applied to each model if the value is an array.
//        It defaults to keeping only 'id'.
//      - set JSON size, e.g. `payloadSize`
//        'unknown' if cannot calculate. Not set if value is undefined.
//      - set array length, e.g. `payloadCount` if it is an array.
// Also rename `errorReason` to `error`.
const getRequestInfo = function (log, loggerFilter) {
  const requestInfo = removeKeys(cloneDeep(log));

  setError(requestInfo);
  reduceInput(requestInfo, loggerFilter);
  reduceAllModels(requestInfo, loggerFilter);

  return requestInfo;
};

const removeKeys = function (requestInfo) {
  return omit(requestInfo, excludedKeys);
};
const excludedKeys = [
  // Those are already present in errorInfo
  'action',
  'fullAction',
  'model',
  'args',
  'command',
];

const setError = function (requestInfo) {
  if (!requestInfo.errorReason) { return; }
  requestInfo.error = requestInfo.errorReason;
  delete requestInfo.errorReason;
};

const reduceInput = function (requestInfo, loggerFilter) {
  setQueryVars(requestInfo, loggerFilter);
  setHeaders(requestInfo, loggerFilter);
  setParams(requestInfo, loggerFilter);
  setSettings(requestInfo, loggerFilter);
};

const setQueryVars = function (requestInfo, loggerFilter) {
  const { queryVars } = requestInfo;
  if (!queryVars || queryVars.constructor !== Object) { return; }
  requestInfo.queryVars = loggerFilter.queryVars(queryVars);
};

const setHeaders = function (requestInfo, loggerFilter) {
  const { headers } = requestInfo;
  if (!headers || headers.constructor !== Object) { return; }
  requestInfo.headers = loggerFilter.headers(headers);
};

const setParams = function (requestInfo, loggerFilter) {
  const { params } = requestInfo;
  if (!params || params.constructor !== Object) { return; }
  requestInfo.params = loggerFilter.params(params);
};

const setSettings = function (requestInfo, loggerFilter) {
  const { settings } = requestInfo;
  if (!settings || settings.constructor !== Object) { return; }
  requestInfo.settings = loggerFilter.settings(settings);
};

const reduceAllModels = function (requestInfo, loggerFilter) {
  setPayload(requestInfo, loggerFilter);
  setActions(requestInfo, loggerFilter);
  setResponse(requestInfo, loggerFilter);
};

const setPayload = function (requestInfo, loggerFilter) {
  reduceModels({
    info: requestInfo,
    attrName: 'payload',
    filter: loggerFilter.payload,
  });
};

const setActions = function (requestInfo, loggerFilter) {
  const { actions } = requestInfo;
  if (!actions || actions.constructor !== Object) { return; }

  for (const actionInfo of Object.values(actions)) {
    setArgData(actionInfo, loggerFilter);
    setActionResponses(actionInfo, loggerFilter);
  }
};

const setArgData = function (actionInfo, loggerFilter) {
  reduceModels({
    info: actionInfo.args,
    attrName: 'data',
    filter: loggerFilter.argData,
  });
};

const setActionResponses = function (actionInfo, loggerFilter) {
  if (actionInfo.responses && actionInfo.responses instanceof Array) {
    actionInfo.responses = actionInfo.responses.map(({ content } = {}) => {
      return content;
    });
  }

  reduceModels({
    info: actionInfo,
    attrName: 'responses',
    filter: loggerFilter.actionResponses,
  });
};

const setResponse = function (requestInfo, loggerFilter) {
  reduceModels({
    info: requestInfo,
    attrName: 'response',
    filter: loggerFilter.response,
  });
};

const reduceModels = function ({ info, attrName, filter }) {
  if (!info) { return; }

  if (info[attrName] === undefined) { return; }

  let size;
  try {
    size = JSON.stringify(info[attrName]).length;
  } catch (e) {
    size = 'unknown';
  }
  info[`${attrName}Size`] = size;

  if (info[attrName] instanceof Array) {
    info[`${attrName}Count`] = info[attrName].length;
    info[attrName] = info[attrName].map(obj => {
      if (!obj || obj.constructor !== Object) { return; }
      return filter(obj);
    });
  } else if (info[attrName] && info[attrName].constructor === Object) {
    info[attrName] = filter(info[attrName]);
  } else if (!info[attrName]) {
    delete info[attrName];
  }
};

module.exports = {
  getRequestInfo,
};
