"use strict";

var expect = require('expect.js'),
    doubles = require('../helpers/doubles'),
    registry = require('../../lib/internal/plugins/registry'),
    feeds = require('../../lib/internal/feeds'),
    pluginsModule = require('../../lib/internal/plugins');

describe('A FeedFactory:', function () {
  var factoriesRegistry, stateFactory, feedFactory;
  beforeEach(function () {
    doubles.stubObject(feeds);
    doubles.stubObject(registry);

    factoriesRegistry = doubles.makeFeedFactoriesRegistry();
    stateFactory = doubles.makeStateFactory();

    registry.feedFactoriesRegistry.returns(factoriesRegistry);
    registry.stateFactory.returns(stateFactory);

    feedFactory = pluginsModule.feedFactory();
  });

  afterEach(function () {
    feeds.restoreOriginal();
    registry.restoreOriginal();
  });

  it("has a registerPlugin function", function () {
    expect(feedFactory.registerPlugin).to.be.a('function');
  });

  describe('registerPlugin():', function () {
    var name, plugin;

    beforeEach(function () {
      name = 'plug name', plugin = doubles.stubFunction();
      feedFactory.registerPlugin(name, plugin);
    });

    it("will delegate to stateFactory.registerPlugin", function () {
      expect(stateFactory.registerPlugin.calledOnce).to.be.ok();
      expect(stateFactory.registerPlugin.calledOn(stateFactory)).to.be.ok();
      expect(stateFactory.registerPlugin.calledWithExactly(name, plugin)).to.be.ok();
    });

    it('will register a new feed factory', function () {
      expect(factoriesRegistry.registerFactoryFor.calledOnce).to.be.ok();
      expect(factoriesRegistry.registerFactoryFor.calledOn(factoriesRegistry)).to.be.ok();
      expect(factoriesRegistry.registerFactoryFor.lastCall.args[0]).to.be(name);
      expect(factoriesRegistry.registerFactoryFor.lastCall.args[1]).to.be.a('function');
    });

    describe('the registered feed factory will', function () {
      var options, bus, result, state, expectedResult;
      beforeEach(function () {
        var factory = factoriesRegistry.registerFactoryFor.lastCall.args[1];
        options = ['x', 'y', 'z'];
        bus = doubles.makeBus();

        state = 'initial state';
        stateFactory.makeStateFor.returns(state);

        expectedResult = doubles.double(['chain']);
        feeds.feed.returns(expectedResult);
        factoriesRegistry.decorateWithPlugins.returns(expectedResult);

        result = factory(bus, options);
      });

      it("ask the state factory to create a new initial state", function () {
        expect(stateFactory.makeStateFor.calledOnce).to.be.ok();
        expect(stateFactory.makeStateFor.calledOn(stateFactory)).to.be.ok();
        expect(stateFactory.makeStateFor.calledWithExactly(name, bus.publish, options)).to.be.ok();
      });

      it("call the feeds module with the bus and initial state to create a feed", function () {
        expect(feeds.feed.calledOnce).to.be.ok();
        expect(feeds.feed.calledWithExactly(bus, state)).to.be.ok();
      });

      it("decorate the new feed with plugins", function () {
        expect(factoriesRegistry.decorateWithPlugins.calledOnce).to.be.ok();
        expect(factoriesRegistry.decorateWithPlugins.calledWithExactly(expectedResult, bus)).to.be.ok();
      });

      it("return the new feed", function () {
        expect(result).to.be(expectedResult);
      });
    });
  });

  describe("makeFeedFor():", function () {
    var name, options, bus;
    beforeEach(function () {
      name = 'some plugin';
      options = ['x', 'y', 'z'];
      bus = doubles.makeBus();
    });

    it('given the factory has not been registered before, it will throw', function () {
      expect(function () {
        feedFactory.makeFeedFor(name, bus, options);
      }).to.throwError();
    });

    describe('given the factory has been registered before, it will', function () {
      var result, factory, aFeed;
      beforeEach(function () {
        aFeed = 'expected feed';
        factory = doubles.stubFunction();
        factory.returns(aFeed);
        factoriesRegistry.factoryFor.returns(factory);

        result = feedFactory.makeFeedFor(name, bus, options);
      });

      it('ask the factories registry for a feed factory for the plugin', function () {
        expect(factoriesRegistry.factoryFor.calledOnce).to.be.ok();
        expect(factoriesRegistry.factoryFor.calledWithExactly(name)).to.be.ok();
      });

      it('ask the found factory to make a new feed with the bus and the options', function () {
        expect(factory.calledOnce).to.be.ok();
        expect(factory.calledWithExactly(bus, options)).to.be.ok();
      });

      it('return the new constructed feed', function () {
        expect(result).to.be(aFeed);
      });
    });
  });
});
