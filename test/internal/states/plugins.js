"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    states = require('../../../lib/internal/states');

describe('The module internal/states can be extended with plugins:', function () {
  it("has a registerPlugin function", function () {
    expect(states.registerPlugin).to.be.a('function');
  });

  describe("given a plugin has been registered,", function () {
    var name, plugin, options;
    beforeEach(function () {
      name = 'some plugin';
      options = ['x', 'y', 'z'];
      plugin = doubles.stubFunction();

      states.registerPlugin(name, plugin);
    });

    it("when stateFactory is called with the plugin names and some options, it will return a function", function () {
      expect(states.stateFactory(name, options)).to.be.a('function');
    });

    it("when stateFactory is called with a non existent plugin name, it will return undefined", function () {
      expect(states.stateFactory('not exists', options)).to.be(undefined);
    });

    describe("given stateFactory has been called with the plugin name and some options, the returned function will", function () {
      var factory, output, expectedResult, result;

      beforeEach(function () {
        output = 'original state output';
        expectedResult = {};
        plugin.returns(expectedResult);

        factory = states.stateFactory(name, options);

        result = factory(output);
      });

      it("call the specified plugin once", function () {
        expect(plugin.calledOnce).to.be.ok();
      });

      it("return the result of the plugin", function () {
        expect(result).to.be(expectedResult);
      });

      it("call the plugin with 3 arguments", function () {
        expect(plugin.lastCall.args.length).to.be(3);
      });

      it("call the plugin with the output as 1st argument", function () {
        expect(plugin.lastCall.args[0]).to.be(output);
      });

      it("call the plugin with a function as 2nd argument", function () {
        expect(plugin.lastCall.args[1]).to.be.a('function');
      });

      it("call the plugin with the options as 3rd argument", function () {
        expect(plugin.lastCall.args[2]).to.be(options);
      });
    });

    describe("the 2nd argument passed to the plugin, when called from the resulting state factory, is another state factory with its output binded to the original one:", function () {
      var factoryBindedToOutput, originalOutput;
      beforeEach(function () {
        originalOutput = 'original state output';
        states.stateFactory(name, options)(originalOutput);

        factoryBindedToOutput = plugin.lastCall.args[1];
      });

      describe("given it has been called with an existing plugin and some options, it will", function () {
        var anotherState, anotherResult, newOptions;
        beforeEach(function () {
          newOptions = ['x', 'c'];
          anotherState = 'another state';

          plugin.reset();
          plugin.returns(anotherState);

          anotherResult = factoryBindedToOutput(name, newOptions);
        });

        it("call the specified plugin once", function () {
          expect(plugin.calledOnce).to.be.ok();
        });

        it("return the result of the plugin", function () {
          expect(anotherResult).to.be(anotherState);
        });

        it("call the plugin with 3 arguments", function () {
          expect(plugin.lastCall.args.length).to.be(3);
        });

        it("call the plugin with the original state output as first argument", function () {
          expect(plugin.lastCall.args[0]).to.be(originalOutput);
        });

        it("call the plugin with the state factory itself as 2nd argument", function () {
          expect(plugin.lastCall.args[1]).to.be(factoryBindedToOutput);
        });

        it("call the plugin with the options as 3rd argument", function () {
          expect(plugin.lastCall.args[2]).to.be(newOptions);
        });
      });
    });
  });
});