"use strict";

var expect = require('expect.js'),
    doubles = require('../helpers/doubles'),
    sinon = require('sinon'),
    feeds = require('../../lib/internal/feeds');

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
      var factory, outputState;

      beforeEach(function () {
        outputState = doubles.makeFeedState();

        factory = feeds.stateFactoryWith(outputState);
      });

      it("will call the specified plugin once", function () {
        factory(name);

        expect(plugin.calledOnce).to.be.ok();
      });
    });

    describe("initialStateFor() will", function () {
      var bus, notificationType, options, result, expectedResult, outputState, stateFactory;
      beforeEach(function () {
        bus = doubles.makeBus();
        notificationType = 'xxx';
        options = ["a", "b", "c"];

        outputState = doubles.makeFeedState();
        sinon.stub(feeds, "yieldingState");
        feeds.yieldingState.returns(outputState);

        stateFactory = doubles.stubFunction();
        sinon.stub(feeds, "stateFactoryWith");
        feeds.stateFactoryWith.returns(stateFactory);

        expectedResult = "plugin result";
        plugin.returns(expectedResult);

        result = feeds.initialStateFor(name, bus, notificationType, options);
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

      it("call the plugin with an yielding state as first argument", function () {
        expect(feeds.yieldingState.calledOnce).to.be.ok();
        expect(feeds.yieldingState.calledWithExactly(bus, notificationType, feeds)).to.be.ok();
        expect(plugin.lastCall.args[0]).to.be(outputState);
      });

      it("call the plugin with a 2nd argument that is a state factory configured with the output state", function () {
        expect(feeds.stateFactoryWith.calledOnce).to.be.ok();
        expect(feeds.stateFactoryWith.calledWithExactly(outputState)).to.be.ok();
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