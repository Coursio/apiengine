'use strict';

const { getReason } = require('../../../error');
const { defaultFormat } = require('../../../formats');

const { getMime, types } = require('./types');
const { serializeContent } = require('./serialize');

// Set basic payload headers, then delegate to protocol handler
const send = function ({
  protocolHandler,
  specific,
  content,
  response,
  type,
  format = defaultFormat,
  topargs,
  error,
}) {
  // If `raw` format was used in input, default format should be used in output
  const formatA = format.name === undefined ? defaultFormat : format;

  const mime = getMime({ format: formatA, type });

  const contentA = serializeContent({
    format: formatA,
    content,
    topargs,
    error,
  });

  const reason = getReason({ error });

  return protocolHandler.send({
    specific,
    content: contentA,
    response,
    type,
    mime,
    reason,
  });
};

module.exports = {
  send,
  types,
};
