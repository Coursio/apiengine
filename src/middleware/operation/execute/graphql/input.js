'use strict';

const { parse } = require('graphql');

const { throwError, addGenErrorHandler } = require('../../../../error');

const getGraphQLInput = function ({ queryVars, payload }) {
  // Parameters can be in either query variables or payload
  // (including by using application/graphql)
  const payloadA = typeof payload === 'object' ? payload : {};
  const { query, variables, operationName } = { ...queryVars, ...payloadA };

  const queryDocument = eParseQuery({ query });

  return { query, variables, operationName, queryDocument };
};

// GraphQL parsing
const parseQuery = function ({ query }) {
  if (!query) {
    throwError('Missing GraphQL query');
  }

  return parse(query);
};

const eParseQuery = addGenErrorHandler(parseQuery, {
  message: 'Could not parse GraphQL query',
  reason: 'GRAPHQL_SYNTAX_ERROR',
});

module.exports = {
  getGraphQLInput,
};