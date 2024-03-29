'use strict';

const path = require('path');
const json5 = require('json5');
const yaml = require('js-yaml');
const toml = require('toml');
require('must');

describe('reconvict', function() {
  const reconvict = require('../');
  const schema = require('./cases/formats/schema');
  const expected_output = require('./cases/formats/out');

  describe('.addParser()', function() {
    it('must not throw on valid parser', function() {
      (function() { reconvict.addParser({ extension: 'json', parse: JSON.parse }); }).must.not.throw();
      (function() { reconvict.addParser({ extension: ['yml', 'yaml'], parse: yaml.safeLoad }); }).must.not.throw();
    });

    it('must not throw on valid array of parsers', function() {
      (function() {
        reconvict.addParser([
          { extension: 'json', parse: JSON.parse },
          { extension: ['yml', 'yaml'], parse: yaml.safeLoad }
        ]);
      }).must.not.throw();
    });

    it('must throw on invalid parser', function() {
      (function() { reconvict.addParser(undefined); }).must.throw();
      (function() { reconvict.addParser(null); }).must.throw();
    });

    it('must throw on invalid parser that is missing extension', function() {
      (function() { reconvict.addParser({ parse: JSON.parse }); }).must.throw();
    });

    it('must throw on invalid parser that has invalid extension', function() {
      (function() { reconvict.addParser({ extension: 100, parse: JSON.parse }); }).must.throw();
      (function() { reconvict.addParser({ extension: ['yml', 100], parse: yaml.parse }); }).must.throw();
    });

    it('must throw on invalid parser that is missing parse function', function() {
      (function() { reconvict.addParser({ extension: 'json' }); }).must.throw();
    });

    it('must throw on invalid parser that has invalid parse function', function() {
      (function() { reconvict.addParser({ extension: 'json', parse: 100 }); }).must.throw();
    });

    it('must throw on invalid array of parsers', function() {
      (function() {
        reconvict.addParser([
          undefined,
          null,
          { extension: 'json' }, // Missing parse function
          { extension: 'json', parse: 100 }, // Invalid parse function
          { parse: JSON.parse }, // Missing extension
          { extension: 100, parse: JSON.parse }, // Invalid extension
          { extension: ['yaml', 200], parse: yaml.parse }, // Invalid extension array
        ]);
      }).must.throw();
    });
  });

  describe('reconvict().loadFile()', function() {
    it('must work using default json5 parser if format isn\'t supported', function() {
      const conf = reconvict(schema);
      conf.loadFile(path.join(__dirname, 'cases/formats/data'));

      (function() { conf.validate() }).must.not.throw();
      conf.get().must.eql(expected_output);
    });

    it('must work with custom json parser', function() {
      reconvict.addParser({ extension: 'json', parse: JSON.parse });

      const conf = reconvict(schema);
      conf.loadFile(path.join(__dirname, 'cases/formats/data.json'));

      (function() { conf.validate() }).must.not.throw();
      conf.get().must.eql(expected_output);
    });

    it('must work with custom json5 parser', function() {
      reconvict.addParser({ extension: 'json5', parse: json5.parse });

      const conf = reconvict(schema);
      conf.loadFile(path.join(__dirname, 'cases/formats/data.json5'));

      (function() { conf.validate() }).must.not.throw();
      conf.get().must.eql(expected_output);
    });

    it('must work with custom yaml parser', function() {
      reconvict.addParser({ extension: ['yml', 'yaml'], parse: yaml.safeLoad });

      const conf = reconvict(schema);
      conf.loadFile(path.join(__dirname, 'cases/formats/data.yaml'));

      (function() { conf.validate() }).must.not.throw();
      conf.get().must.eql(expected_output);
    });

    it('must work with custom toml parser', function() {
      reconvict.addParser({ extension: 'toml', parse: toml.parse });

      const conf = reconvict(schema);
      conf.loadFile(path.join(__dirname, 'cases/formats/data.toml'));

      (function() { conf.validate() }).must.not.throw();
      conf.get().must.eql(expected_output);
    });

    it('must use wildcard parser if no parser is registered for extension', function() {
      const message = 'Unsupported file type'
      reconvict.addParser({ extension: '*', parse: function() { throw new Error(message) } });

      const conf = reconvict(schema);
      (function() { conf.loadFile(path.join(__dirname, 'cases/formats/data.xml')) }).must.throw(message);
    });
	
    it('must not break when parsing an empty file', function() {
      reconvict.addParser({ extension: ['yml', 'yaml'], parse: yaml.safeLoad });
    
      const conf = reconvict(schema);
      conf.loadFile(path.join(__dirname, 'cases/formats/data.empty.yaml'));
    
      (function() { conf.validate() }).must.not.throw();
    });
  });
});
