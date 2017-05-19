'use strict';


const { transformInput, transformOutput } = require('./transformer');


/**
 * Applies schema `transform` and `transformOut`
 * Those are mapping functions applies on input or output
 * for a particular attribute.
 * `transform` is applied on input, `transformOut` is applied on output.
 * They can be any static value or JSL.
 **/
const transform = function ({ idl: { models } }) {
  return async function transform(input) {
    const {
      args,
      command,
      modelName,
      info: { helpers, variables },
      interf,
      protocol,
    } = input;
    const { ip, timestamp } = protocol;
    const { params } = interf;
    const jslInput = {
      helpers,
      variables,
      requestInput: { ip, timestamp, params },
      interfaceInput: { command },
    };

    // Retrieves IDL definition for this model
    const modelIdl = models[modelName];
    const propsIdl = modelIdl && modelIdl.properties;
    const transformArgs = { propsIdl, jslInput };

    // Transform input, then output
    if (args.data) {
      const tfArg = Object.assign({ value: args.data }, transformArgs);
      args.data = transformInput(tfArg);
    }

    const response = await this.next(input);
    const tfArg = Object.assign({ value: response.data }, transformArgs);
    response.data = transformOutput(tfArg);

    return response;
  };
};



module.exports = {
  transform,
};
