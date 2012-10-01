"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    sinon = require('sinon'),
    feeds = require('../../../lib/internal/feeds');

describe('The module internal/feeds can be extended with plugins:', function () {
  it("has a registerPlugin function", function () {
    expect(feeds.registerPlugin).to.be.a('function');
  });

  it("registerPlugin() will add the plugin of a member of feeds.plugins", function () {
    var name = 'plugin name', plugin = doubles.stubFunction();

    feeds.registerPlugin(name, plugin);

    expect(feeds.plugins).to.be.an('object');
    expect(feeds.plugins).not.to.be(null);
    expect(feeds.plugins[name]).to.be(plugin);
  });

  describe("given a plugin has been registered,", function () {
    var name, plugin;
    beforeEach(function () {
      name = 'some plugin';
      plugin = doubles.stubFunction();

      feeds.registerPlugin(name, plugin);
    });

    it("stateFactoryWith() will return a function", function () {
      var outputState = doubles.makeFeedState();

      expect(feeds.stateFactoryWith(outputState)).to.be.a('function');
    });

    describe("given stateFactoryWith has been called, the returned factory will", function () {
      var factory, output, expectedResult, result, options;

      beforeEach(function () {
        options = ['x', 'y', 'z'];
        output = {};
        expectedResult = {};
        plugin.returns(expectedResult);

        factory = feeds.stateFactoryWith(output);
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

    describe("initialStateFor() will", function () {
      var bus, options, result, expectedResult, output, stateFactory;
      beforeEach(function () {
        bus = {};
        options = ["a", "b", "c"];

        output = {};
        sinon.stub(feeds, "yieldingState");
        feeds.yieldingState.returns(output);

        stateFactory = doubles.stubFunction();
        sinon.stub(feeds, "stateFactoryWith");
        feeds.stateFactoryWith.returns(stateFactory);

        expectedResult = "plugin result";
        plugin.returns(expectedResult);

        result = feeds.initialStateFor(name, bus, options);
      });

      afterEach(function () {
        feeds.yieldingState.restore();
        feeds.stateFactoryWith.restore();
      });

      it("call the plugin only once", function () {
        expect(plugin.calledOnce).to.be.ok();
      });

      it("call the plugin with 3 arguments", function () {
        expect(plugin.lastCall.args.length).to.be(3);
      });

      it("call the plugin with a yielding state as first argument (output)", function () {
        expect(feeds.yieldingState.calledOnce).to.be.ok();
        expect(feeds.yieldingState.calledWithExactly(bus, feeds)).to.be.ok();
        expect(plugin.lastCall.args[0]).to.be(output);
      });

      it("call the plugin with a 2nd argument that is a state factory configured with the output", function () {
        expect(feeds.stateFactoryWith.calledOnce).to.be.ok();
        expect(feeds.stateFactoryWith.calledWithExactly(output)).to.be.ok();
        expect(plugin.lastCall.args[1]).to.be(stateFactory);
      });

      it("call the plugin with the options as 3rd argument", function () {
        expect(plugin.lastCall.args[2]).to.be(options);
      });

      it("return the plugin result", function () {
        expect(result).to.be(expectedResult);
      });
    });
  });
});