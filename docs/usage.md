# Command line

The server can be used from the command line:

```bash
apiengine [INSTRUCTION] [--options]
```

The default `INSTRUCTION` is `run`.

Use `apiengine --help` for usage instructions.

Use `apiengine completion` if you want to enable command line auto-completion.

# Node.js

The server can also be used from Node.js:

<!-- eslint-disable strict, no-undef -->
```javascript
const apiEngine = require('api-engine');

apiEngine.run({ ...options });
```

Here we used the `INSTRUCTION` `run`, but any `INSTRUCTION` can be used.

# Instructions

The following instructions are available:
  - [run](run.md): start the server

# Options

See this [documentation](configuration.md) to learn about how to specify
options and configuration.