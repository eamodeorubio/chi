"use strict";

var expect = require('expect.js'),
    doubles = require('../helpers/doubles'),
    registry = require('../../lib/internal/plugins/registry'),
    feeds = require('../../lib/internal/feeds'),
    pluginsModule = require('../../lib/internal/plugins');

describe('A PluginScope:', function () {
  var factoriesRegistry, stateFactory, pluginScope;
  beforeEach(function () {
    doubles.stubFeedsModule(feeds);
    doubles.stubRegistryModule(registry);
    factoriesRegistry = doubles.makeFeedFactoriesRegistry();
    stateFactory = doubles.makeStateFactory();
    registry.feedFactoriesRegistry.returns(factoriesRegistry);
    registry.stateFactory.returns(stateFactory);

    pluginScope = pluginsModule.scope();
  });

  afterEach(function () {
    feeds.restoreOriginal();
    registry.restoreOriginal();
  });

  it("has a registerPlugin function", function () {
    expect(pluginScope.registerPlugin).to.be.a('function');
  });

  it("registerPlugin() will delegate to stateFactory.registerPlugin", function () {
    var name = 'plug name', plugin = doubles.stubFunction();

    pluginScope.registerPlugin(name, plugin);

    expect(stateFactory.registerPlugin.calledOnce).to.be.ok();
    expect(stateFactory.registerPlugin.calledOn(stateFactory)).to.be.ok();
    expect(stateFactory.registerPlugin.calledWithExactly(name, plugin)).to.be.ok();
  });

  describe("given a plugin has been registered,", function () {
    var name, plugin, options;
    beforeEach(function () {
      name = 'some plugin';
      options = ['x', 'y', 'z'];
      plugin = doubles.stubFunction();

      pluginScope.registerPlugin(name, plugin);
    });

    describe("feedFactoryForPlugin():", function () {
      it('given the factory has been registered before, it will return the function returned by the factories registry', function () {
        var aFactory = doubles.stubFunction();
        factoriesRegistry.factoryFor.returns(aFactory);

        var result = pluginScope.feedFactoryForPlugin(name);

        expect(factoriesRegistry.factoryFor.calledOnce).to.be.ok();
        expect(factoriesRegistry.factoryFor.calledWithExactly(name)).to.be.ok();
        expect(result).to.be(aFactory);
      });

      describe('given it is the first time we ask for the factory, when called it will', function () {
        var result;

        beforeEach(function () {
          factoriesRegistry.factoryFor.returns(undefined);

          result = pluginScope.feedFactoryForPlugin(name);
        });

        it('return a function', function () {
          expect(result).to.be.a('function');
        });

        it('register the returned function as a feed factory', function () {
          expect(factoriesRegistry.registerFactoryFor.calledOnce).to.be.ok();
          expect(factoriesRegistry.registerFactoryFor.calledOn(factoriesRegistry)).to.be.ok();
          expect(factoriesRegistry.registerFactoryFor.calledWithExactly(name, result)).to.be.ok();
        });
      });

      describe("the returned function is a feed factory, and when called with a bus and some options", function () {
        var options, aFeed, state, expectedResultingFeed, bus;
        beforeEach(function () {
          expectedResultingFeed = doubles.double(['chain']);
          feeds.feed.returns(expectedResultingFeed);
          bus = doubles.makeBus();
          state='initial state';
          options = ['a', 'b', 'c'];

          stateFactory.makeStateFor.returns(state);
          factoriesRegistry.decorateWithPlugins.returns(expectedResultingFeed);

          aFeed = pluginScope.feedFactoryForPlugin(name)(bus, options);
        });

        it("will ask pluginsRegistry for a state factory with the options and the plugin name to create a state factory", function () {
          expect(stateFactory.makeStateFor.calledOnce).to.be.ok();
          expect(stateFactory.makeStateFor.calledOn(stateFactory)).to.be.ok();
          expect(stateFactory.makeStateFor.calledWithExactly(name, bus.publish, options)).to.be.ok();
        });

        it("will call the feeds module with the bus factory and the state factory to create a feed", function () {
          expect(feeds.feed.calledOnce).to.be.ok();
          expect(feeds.feed.calledWithExactly(bus, state)).to.be.ok();
        });

        it("will return the resulting feed", function () {
          expect(aFeed).to.be(expectedResultingFeed);
        });

        it("the result will be decorated with plugins", function () {
          expect(factoriesRegistry.decorateWithPlugins.calledOnce).to.be.ok();
          expect(factoriesRegistry.decorateWithPlugins.calledWithExactly(aFeed, bus)).to.be.ok();
        });
      });
    });
  });
});