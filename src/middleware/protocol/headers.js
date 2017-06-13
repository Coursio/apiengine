'use strict';


const parsing = require('../../parsing');


// Fill in `input.headers` using protocol-specific headers.
// Are set in a protocol-agnostic format, i.e. each protocol sets the same
// object.
// Meant to be used to create (in coming middleware) `input.settings` and
// `input.params`, but can also be used by operation layer as is.
const parseHeaders = function () {
  return async function parseHeaders(input) {
    const { specific, protocol, log } = input;
    const perf = log.perf.start('protocol.parseHeaders', 'middleware');

    const headers = parsing[protocol].headers.parse({ specific });

    log.add({ headers });
    Object.assign(input, { headers });

    perf.stop();
    const response = await this.next(input);
    return response;
  };
};


module.exports = {
  parseHeaders,
};
