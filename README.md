[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

This is a web server engine.

You simply pass a single [declarative file](docs/idl.md) as input, and a
full-featured [GraphQL](http://graphql.org/) server will start.

# Features

  - standard-compliant HTTP server
  - [GraphQL endpoint](docs/graphql.md#client-queries),
    including introspection, interactive debugger and schema printing
  - [CRUD actions](docs/graphql.md#read-queries):
    find, create, update, replace, upsert, delete.
    Each action can be performed on a single model or on several models.
  - [relations, nested actions](docs/relations.md)
    and populating between models, including for mutations
  - [filtering](docs/filtering.md), which can use custom logic
  - [sorting](docs/sorting.md)
  - [selecting](docs/selecting.md)
  - [pagination](docs/pagination.md)
  - [dry runs](docs/settings.md#dry-runs)
  - [silent outputs](docs/settings.md#silent-output)
  - [input validation](docs/validation.md#data-validation)
  - [default values](docs/transformation.md#default-values)
  - [aliases](docs/compatibility.md#aliases)
  - [transformation on input](docs/transformation.md#transformations),
    e.g. for normalization
  - [computed values](docs/transformation.md#computed-attributes),
    e.g. `name = first_name + last_name`
  - [authorization](docs/authorization.md)
  - automatic attributes:
    [`created_time`, `updated_time`](docs/plugins.md#timestamps),
    [`created_by`, `updated_by`](docs/plugins.md#model-authors)
  - [custom JavaScript logic](docs/functions.md) and [plugins](docs/plugins.md)
  - extensive [error handling](docs/error.md) and
    [logging](docs/events.md#logging) capabilities
  - [performance monitoring](docs/performance.md#performance-monitoring)
  - [request timeout](docs/performance.md#request-timeout)

# Missing features

See the [roadmap](ROADMAP.md).

# Starting the server

See [here](docs/usage.md).

# Client queries

You can learn how to perform queries against this server [here](docs/graphql.md)

# Contribute

See [here](CONTRIBUTE.md).
