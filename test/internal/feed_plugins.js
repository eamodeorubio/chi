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

    describe("initialStateFor will", function () {
      var bus, notificationType, options, result, expectedResult, state;
      beforeEach(function () {
        bus = doubles.makeBus();
        notificationType = 'xxx';
        options = ["a", "b", "c"];

        state = doubles.makeFeedState();
        sinon.stub(feeds, "yieldingState");
        feeds.yieldingState.returns(state);

        expectedResult = "plugin result";
        plugin.returns(expectedResult);

        result = feeds.initialStateFor(name, bus, notificationType, options);
      });

      afterEach(function () {
        feeds.yieldingState.restore();
      });

      it("call the plugin only once", function () {
        expect(plugin.calledOnce).to.be.ok();
      });

      it("call the plugin with 3 arguments", function () {
        expect(plugin.lastCall.args.length).to.be(3);
      });

      it("call the plugin with a yielding state as first argument", function () {
        expect(feeds.yieldingState.calledOnce).to.be.ok();
        expect(feeds.yieldingState.calledWithExactly(bus, notificationType, feeds)).to.be.ok();
        expect(plugin.lastCall.args[0]).to.be(state);
      });

      it("call the plugin with a function as 2nd argument", function () {
        expect(plugin.lastCall.args[1]).to.be.a('function');
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