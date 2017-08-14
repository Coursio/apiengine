'use strict';

const { idlReducer } = require('../reducer');
const { validateIdlCircularRefs } = require('../circular_refs');

const { validateData } = require('./data');
const { validateModelNames } = require('./model_names');
const { validateIdlSyntax } = require('./syntax');
const { validateIdlJsl } = require('./jsl');

// Make sure validators are run in a specific order
const validators = [
  validateIdlCircularRefs,
  validateData,
  validateModelNames,
  validateIdlSyntax,
  validateIdlJsl,
];

// Validate IDL definition
const preValidateIdl = idlReducer.bind(null, validators);

module.exports = {
  preValidateIdl,
};