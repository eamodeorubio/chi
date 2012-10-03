"use strict";

var expect = require('expect.js'),
    doubles = require('./../helpers/doubles'),
    busModule = require('../../lib/internal/bus'),
    feeds = require('../../lib/internal/feeds'),
    plugins = require('../../lib/internal/plugins'),
    chi = require('../../lib/chi');

describe("The module chi can be extended with plugins:", function () {
  it("has a registerPlugin function", function () {
    expect(chi.registerPlugin).to.be.a('function');
  });

  describe("given registerPlugin() has been called with a name and a function,", function () {
    var name, plugin;
    beforeEach(function () {
      name = "plugme";
      plugin = doubles.stubFunction();

      doubles.stubFeedsModule(feeds);
      doubles.stubPluginsModule(plugins);

      chi.registerPlugin(name, plugin);
    });

    afterEach(function () {
      feeds.restoreOriginal();
      plugins.restoreOriginal();
    });

    it("will register the plugin in the states module", function () {
      expect(plugins.registerPlugin.calledOnce).to.be.ok();
      expect(plugins.registerPlugin.calledWithExactly(name, plugin)).to.be.ok();
    });

    it("will register a function in the feeds module as a plugin", function () {
      expect(feeds.registerPlugin.calledOnce).to.be.ok();
      expect(feeds.registerPlugin.lastCall.args.length).to.be(2);
      expect(feeds.registerPlugin.lastCall.args[0]).to.be(name);
      expect(feeds.registerPlugin.lastCall.args[1]).to.be.a('function');
    });

    describe("the registered function in the feeds module, when called with a bus factory and some options", function () {
      var makeBus, options, result, makeState, expectedResult;
      beforeEach(function () {
        expectedResult = 'new feed';
        feeds.feed.returns(expectedResult);
        makeBus = doubles.stubFunction();
        makeState = doubles.stubFunction();
        options = ['a', 'b', 'c'];

        plugins.stateFactory.returns(makeState);

        result = feeds.registerPlugin.lastCall.args[1](makeBus, options);
      });

      it("will call the states module with the options and the plugin name to create a state factory", function () {
        expect(plugins.stateFactory.calledOnce).to.be.ok();
        expect(plugins.stateFactory.calledWithExactly(name, options)).to.be.ok();
      });

      it("will call the feeds module with the bus factory and the state factory to create a feed", function () {
        expect(feeds.feed.calledOnce).to.be.ok();
        expect(feeds.feed.calledWithExactly(makeBus, makeState)).to.be.ok();
      });

      it("will return the resulting feed", function () {
        expect(result).to.be(expectedResult);
      });
    });

    it("then a factory method with the same name that the plugin will be available in chi", function () {
      expect(chi[name]).to.be.a('function');
    });

    describe("when the new factory method is called,", function () {
      var stateFactory;

      beforeEach(function () {
        stateFactory = doubles.stubFunction();

        plugins.stateFactory.returns(stateFactory);
      });

      it("it will return the feed built by the feeds module", function () {
        var expectedResult = 'expected result';

        feeds.feed.returns(expectedResult);

        expect(chi[name]()).to.be(expectedResult);
      });

      it("without parameters, it will create a feed with busModule.emitter and a state factory created with the plugin name and an empty array", function () {
        chi[name]();

        expect(plugins.stateFactory.calledOnce).to.be.ok();
        expect(plugins.stateFactory.calledWithExactly(name, [])).to.be.ok();

        expect(feeds.feed.calledOnce).to.be.ok();
        expect(feeds.feed.calledWithExactly(busModule.emitter, stateFactory)).to.be.ok();
      });

      it("with false as a parameter, it will create a feed with busModule.emitter and a state factory created with the plugin name and an empty array", function () {
        chi[name](false);

        expect(plugins.stateFactory.calledOnce).to.be.ok();
        expect(plugins.stateFactory.calledWithExactly(name, [])).to.be.ok();

        expect(feeds.feed.calledOnce).to.be.ok();
        expect(feeds.feed.calledWithExactly(busModule.emitter, stateFactory)).to.be.ok();
      });

      it("with true as a parameter, it will create a feed with busModule.storage and a state factory created with the plugin name and an empty array", function () {
        chi[name](true);

        expect(plugins.stateFactory.calledOnce).to.be.ok();
        expect(plugins.stateFactory.calledWithExactly(name, [])).to.be.ok();

        expect(feeds.feed.calledOnce).to.be.ok();
        expect(feeds.feed.calledWithExactly(busModule.storage, stateFactory)).to.be.ok();
      });

      it("with true and more parameters, it will create a feed with busModule.storage and a state factory created with the plugin name and an array with the extra parameters", function () {
        chi[name](true, '', 0);

        expect(plugins.stateFactory.calledOnce).to.be.ok();
        expect(plugins.stateFactory.calledWithExactly(name, ['', 0])).to.be.ok();

        expect(feeds.feed.calledOnce).to.be.ok();
        expect(feeds.feed.calledWithExactly(busModule.storage, stateFactory)).to.be.ok();
      });

      it("with a first argument that is not a boolean, it will create a feed with busModule.emitter and a state factory created with the plugin name and an array with all parameters", function () {
        chi[name](1);

        expect(plugins.stateFactory.calledOnce).to.be.ok();
        expect(plugins.stateFactory.calledWithExactly(name, [1])).to.be.ok();

        expect(feeds.feed.calledOnce).to.be.ok();
        expect(feeds.feed.calledWithExactly(busModule.emitter, stateFactory)).to.be.ok();
      });
    });
  });
});