'use strict';


const { map } = require('../../utilities');
const { isJsl } = require('../test');
const { throwJslError } = require('../error');
const { getRawJsl } = require('../tokenize');
const { compileJsl } = require('./compile');
const { checkNames } = require('./validation');


// Instance containing JSL parameters and helpers, re-created for each request
class Jsl {

  constructor({ input = {} } = {}) {
    this.input = input;
  }

  // Return a shallow copy.
  // Reason: requests can trigger several sub-requests, which should be
  // independant from each other, i.e. all get their own JSL instance.
  add(input = {}, { type = 'SYSTEM' } = {}) {
    checkNames(input, type);
    const newInput = Object.assign({}, this.input, input);
    return new Jsl({ input: newInput });
  }

  // Take JSL, inline or not, and turns into `function (...args)`
  // firing the first one, with $1, $2, etc. provided as extra arguments
  addHelpers({ helpers = {} }) {
    const compiledHelpers = map(helpers, helper => {
      // Non-inline helpers only get positional arguments, no parameters
      if (typeof helper === 'function') { return helper; }

      // Constants are left as is
      if (!isJsl({ jsl: helper })) { return helper; }

      // JSL is run with current instance
      return (...args) => {
        // Provide $1, $2, etc. to inline JSL
        const [$1, $2, $3, $4, $5, $6, $7, $8, $9] = args;
        const input = { $1, $2, $3, $4, $5, $6, $7, $8, $9 };

        return this.run({ value: helper, input });
      };
    });

    // Allow helpers to reference each other
    Object.assign(this.input, compiledHelpers);

    return this.add(compiledHelpers, { type: 'USER' });
  }

  // Process (already compiled) JSL function,
  // i.e. fires it and returns its value
  // If this is not JSL, returns as is
  run({ value, input = {}, type = 'system' }) {
    try {
      const params = Object.assign({}, this.input, input);
      const paramsKeys = Object.keys(params);
      const jslFunc = compileJsl({ jsl: value, paramsKeys, type });

      if (typeof jslFunc !== 'function') { return jslFunc; }
      return jslFunc(params);
    } catch (innererror) {
      // JSL without parenthesis
      const rawJsl = getRawJsl({ jsl: value });
      // If non-inline function, function name
      const funcName = typeof value === 'function' &&
        value.name &&
        `${value.name}()`;
      const expression = rawJsl || funcName || value;
      const message = `JSL expression failed: '${expression}'`;
      throwJslError({ message, type, innererror });
    }
  }
}


module.exports = {
  Jsl,
};
