'use strict';


const { Jsl } = require('../../jsl');
const { protocolValidation } = require('./validation');


// Converts from no format to Protocol format
const protocolConvertor = function ({ idl: { helpers } }) {
  return async function protocolConvertor(input) {
    const jsl = (new Jsl()).addHelpers({ helpers });
    const nextInput = { jsl, specific: input };

    protocolValidation({ input: nextInput });

    const response = await this.next(nextInput);
    return response;
  };
};


module.exports = {
  protocolConvertor,
};
