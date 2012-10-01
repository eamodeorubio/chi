"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    states = require('../../../lib/internal/states');

describe('The module internal/states can be extended with plugins:', function () {
  it("has a registerPlugin function", function () {
    expect(states.registerPlugin).to.be.a('function');
  });

  it("registerPlugin() will add the plugin of a member of feeds.plugins", function () {
    var name = 'plugin name', plugin = doubles.stubFunction();

    states.registerPlugin(name, plugin);

    expect(states.plugins).to.be.an('object');
    expect(states.plugins).not.to.be(null);
    expect(states.plugins[name]).to.be(plugin);
  });

  describe("given a plugin has been registered,", function () {
    var name, plugin;
    beforeEach(function () {
      name = 'some plugin';
      plugin = doubles.stubFunction();

      states.registerPlugin(name, plugin);
    });

    it("stateFactoryWith() will return a function", function () {
      var outputState = doubles.makeFeedState();

      expect(states.stateFactoryWith(outputState)).to.be.a('function');
    });

    describe("given stateFactoryWith has been called, the returned factory will", function () {
      var factory, output, expectedResult, result, options;

      beforeEach(function () {
        options = ['x', 'y', 'z'];
        output = {};
        expectedResult = {};
        plugin.returns(expectedResult);

        factory = states.stateFactoryWith(output);
        result = factory(name, options);
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

      it("call the plugin with the output state as first argument", function () {
        expect(plugin.lastCall.args[0]).to.be(output);
      });

      it("call the plugin with the state factory itself 2nd argument that is the same state", function () {
        expect(plugin.lastCall.args[1]).to.be(factory);
      });

      it("call the plugin with the options as 3rd argument", function () {
        expect(plugin.lastCall.args[2]).to.be(options);
      });
    });
  });
});