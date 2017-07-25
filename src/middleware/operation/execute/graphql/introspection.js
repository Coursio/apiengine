'use strict';

const { execute } = require('graphql');

const { throwError } = require('../../../../error');

const handleIntrospection = async function ({
  schema,
  queryDocument,
  variables,
  operationName,
}) {
  const response = await getIntrospectionResponse({
    schema,
    queryDocument,
    variables,
    operationName,
  });

  if (response.errors && response.errors[0]) {
    const [innererror] = response.errors;
    throwError('GraphQL introspection query failed', {
      reason: 'GRAPHQL_INTROSPECTION',
      innererror,
    });
  }

  return response;
};

const getIntrospectionResponse = async function ({
  schema,
  queryDocument,
  variables,
  operationName,
}) {
  try {
    return await execute(
      schema,
      queryDocument,
      {},
      {},
      variables,
      operationName,
    );
  // Exception can be fired in several ways by GraphQL.js:
  //  - throwing an exception
  //  - returning errors in response
  } catch (error) {
    throwError('GraphQL introspection query failed', {
      reason: 'GRAPHQL_INTROSPECTION',
      innererror: error,
    });
  }
};

// At the moment, we do not support mixing introspection query with
// non-introspection query, except for `__typename`
// This means that `__schema` or `__type` must be the only top-level properties
// when specified
const introspectionQueryRegExp = /(\b__schema\b)|(\b__type\s*\()/;

const isIntrospectionQuery = function ({ query }) {
  return introspectionQueryRegExp.test(query);
};

module.exports = {
  handleIntrospection,
  isIntrospectionQuery,
};
