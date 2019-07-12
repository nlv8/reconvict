# reconvict

Drop-in replacement for [node-convict](https://github.com/mozilla/node-convict) with support for runtime configuration reloading like an absolute boss.

## Features

* **Live configuration objects**: Getting nested objects from the configuration will return live objects that reflect configuration changes.
* **Emission of configuration changes**: A configuration is an `EventEmitter` that will emit modified keys upon changes.
* And everything supported by *node-convict*:
  * **Loading and merging**,
  * **Nested structure**,
  * **Environmental variables**,
  * **Command-line arguments**,
  * **Validation**,
  * **Comments allowed**,
  * **Configuration file additional types support**.

## Install

```shell
npm install @nlv8/reconvict
```

## Usage

An example `config.js` file:

```javascript
var reconvict = require('@nlv8/reconvict');

// Define a schema
var config = reconvict({
  env: {
    doc: "The application environment.",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV"
  },
  greeting: {
    message: {
      doc: 'The greeting message presented to users.',
      format: String,
      default: 'Hello!'
    }
  },
  server: {
    ip: {
      doc: "The IP address to bind.",
      format: "ipaddress",
      default: "127.0.0.1",
      env: "IP_ADDRESS",
    },
    port: {
      doc: "The port to bind.",
      format: "port",
      default: 8080,
      env: "PORT",
      arg: "port"
    }
  }
});

// Load environment dependent configuration
var env = config.get('env');
config.loadFile('./config/' + env + '.json');

// Perform validation
config.validate({allowed: 'strict'});

module.exports = config;
```

An example `server.js` file leveraging the `config.js` file above:

```javascript
var http = require('http');
var config = require('./config.js');

// Listening on changes like an absolute boss.
config.on('change', (changedKeys, config) => {
  console.log('Configuration changed! Changed keys and values:');

  changedKeys.forEach(key => {
    console.log(`${key} – ${config.get(key)}`)
  })
});

const greeting = config.get('greeting')

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  // Will magically change to the latest configuration value :)
  // However, you cannot modify it :O
  res.end(`${greeting.message}\n`);
});

server.listen(config.get('port'), config.get('ip'), function(x) {
  var addy = server.address();
  console.log('running on http://' + addy.address + ":" + addy.port);
});

// Let's make some change.
setTimeout(() => {
  config.set('greeting.message', 'Hola!');
}, 10000)
```

To launch your example server, and set a port:

```shell
node ./server.js --port 8080
```

*Note*: arguments *must* be supplied with the double-hyphen `--arg`. (Single hypen's are not supported at this time)

## API

For the original `node-convict` methods, please see: [`node-convict/API`](https://github.com/mozilla/node-convict#api).

### config.forceLoad(object)

Works the same as `load` but will ignore environment variables and arguments originally given to the script.

### config.forceLoadFile(file or fileArray)

Works the same as `load` but will ignore environment variables and arguments originally given to the script.
