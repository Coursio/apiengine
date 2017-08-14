# Configuration

They are two main configuration files: the [IDL file](#idl-file) and the
[runtime options](#runtime-options).

# IDL file

The [IDL file](idl.md) is where you define your data model and business logic.

There are several ways to define the [IDL file](idl.md).
The first one that is defined will be chosen, from the highest priority
to the lowest:
  - setting an environment variable `API_ENGINE__IDL` containing the path to
    the [configuration file](#configuration-file)
  - using `apiEngine.start({ idl: 'path' })` with a `'path'` to
    the [configuration file](#configuration-file)
  - creating a `api_engine.idl.yml`, `api_engine.idl.yaml` or
    `api_engine.idl.json` file in the current directory, or any parent
    directory. This is the preferred method.

# Runtime options

Runtime options are runtime parameters, e.g. server ports.

There are several ways to define runtime options. The first one that is defined
will be chosen, from the highest priority to the lowest:
  - setting an environment variable `API_ENGINE__OPTS` containing the path to
    the [configuration file](#configuration-file)
  - using `apiEngine.start({ runtime: object })` with `object` being the
    runtime options
  - using `apiEngine.start({ runtime: 'path' })` with a `'path'` to
    the [configuration file](#configuration-file)
  - creating a `api_engine.runtime.yml`, `api_engine.runtime.yaml` or
    `api_engine.runtime.json` file in the current directory, or any parent
    directory. This is the preferred method.

See [here](server.md#runtime-options) for a list of available runtime options.

# Configuration file

The [IDL file](#idl-file) and the [runtime options file](#runtime-options) share
the same format.

The format depends on the file extension, and can be:
  - JSON
  - YAML, but only with JSON-compatible types

If a relative file path is used to target the configuration file, it will be
relative to the current directory.

The [IDL file](#idl-file) (but not the [runtime options file](#runtime-options))
can also be broken down into several files or use libraries. It does so by
referring to external files (local or HTTP/HTTPS) or Node.js modules, using
[JSON references](https://tools.ietf.org/html/draft-pbryan-zyp-json-ref-03).
Those are simple objects with a single `$ref` property pointing to the file,
e.g.:

```yml
models:
  user:
    $ref: user.yml
```

[JSON references](https://tools.ietf.org/html/draft-pbryan-zyp-json-ref-03)
can also be used to reference a property in the current file:

```yml
models:
  user:
    $ref: '#/models/old_user'
```

# Environment variables

Environment variables prefixed with `API_ENGINE__` can be specified to override
specific runtime options.

The following environment variables can also be used:
  - `NODE_ENV`: for `env`
  - `HOST`: for `http.host`
  - `PORT`: for `http.port`

E.g. the following environment variables:
```toml
NODE_ENV="dev"
API_ENGINE__MAX_PAGE_SIZE=200
API_ENGINE__HTTP__HOST="myhost"
API_ENGINE__LOG_FILTER__PAYLOAD__0="id"
API_ENGINE__LOG_FILTER__PAYLOAD__1="old_id"
```

will be converted to the following runtime options, which will override
(but not fully replace) the current runtime options:

```json
{
  "env": "dev",
  "maxPageSize": 200,
  "http": { "host": "myhost" },
  "logFilter": { "payload": ["id", "old_id"] },
}
```

Note:
  - the names are converted to camelCase
  - `__` is used to nest objects and arrays