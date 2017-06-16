'use strict';


// Retrieve request's IP, assigned to protocol input, and also to JSL $IP
const getIp = function () {
  return async function getIp(input) {
    const { jsl, log, protocolHandler } = input;
    const perf = log.perf.start('protocol.getIp', 'middleware');

    const ip = protocolHandler.getIp(input) || '';
    const newJsl = jsl.add({ $IP: ip });
    log.add({ ip });

    Object.assign(input, { ip, jsl: newJsl });

    perf.stop();
    const response = await this.next(input);
    return response;
  };
};


module.exports = {
  getIp,
};