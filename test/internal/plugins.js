"use strict";

var expect = require('expect.js'),
    doubles = require('../helpers/doubles'),
    registry = require('../../lib/internal/plugins/registry'),
    feeds = require('../../lib/internal/feeds'),
    pluginsModule = require('../../lib/internal/plugins');

describe('A FeedFactory:', function () {
  var factoriesRegistry, stateFactory, feedFactory;
  beforeEach(function () {
    doubles.stubFeedsModule(feeds);
    doubles.stubRegistryModule(registry);
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

  it("registerPlugin() will delegate to stateFactory.registerPlugin", function () {
    var name = 'plug name', plugin = doubles.stubFunction();

    feedFactory.registerPlugin(name, plugin);

    expect(stateFactory.registerPlugin.calledOnce).to.be.ok();
    expect(stateFactory.registerPlugin.calledOn(stateFactory)).to.be.ok();
    expect(stateFactory.registerPlugin.calledWithExactly(name, plugin)).to.be.ok();
  });

  describe("given a plugin has been registered,", function () {
    var name, plugin, options, bus;
    beforeEach(function () {
      name = 'some plugin';
      options = ['x', 'y', 'z'];
      bus = doubles.makeBus();
      plugin = doubles.stubFunction();

      feedFactory.registerPlugin(name, plugin);
    });

    describe("makeFeedFor():", function () {
      it('will ask the factories registry for a feed factory for the plugin', function () {
        feedFactory.makeFeedFor(name, bus, options);

        expect(factoriesRegistry.factoryFor.calledOnce).to.be.ok();
        expect(factoriesRegistry.factoryFor.calledWithExactly(name)).to.be.ok();
      });

      describe('given the factory has been registered before, when called it will', function () {
        var result, factory, aFeed;
        beforeEach(function () {
          aFeed = 'expected feed';
          factory = doubles.stubFunction();
          factory.returns(aFeed);
          factoriesRegistry.factoryFor.returns(factory);

          result = feedFactory.makeFeedFor(name, bus, options);
        });

        it('ask the found factory to make a new feed with the bus and the options', function () {
          expect(factory.calledOnce).to.be.ok();
          expect(factory.calledWithExactly(bus, options)).to.be.ok();
        });

        it('return the new constructed feed', function () {
          expect(result).to.be(aFeed);
        });
      });

      describe('given it is the first time we ask for the factory, when called it will', function () {
        var result, expectedResultingFeed, state;

        beforeEach(function () {
          factoriesRegistry.factoryFor.returns(undefined);

          state = 'initial state';
          stateFactory.makeStateFor.returns(state);

          expectedResultingFeed = doubles.double(['chain']);
          feeds.feed.returns(expectedResultingFeed);
          factoriesRegistry.decorateWithPlugins.returns(expectedResultingFeed);

          result = feedFactory.makeFeedFor(name, bus, options);
        });

        it('register a new function as a feed factory', function () {
          expect(factoriesRegistry.registerFactoryFor.calledOnce).to.be.ok();
          expect(factoriesRegistry.registerFactoryFor.calledOn(factoriesRegistry)).to.be.ok();
          expect(factoriesRegistry.registerFactoryFor.lastCall.args[0]).to.be(name);
          expect(factoriesRegistry.registerFactoryFor.lastCall.args[1]).to.be.a('function');
        });

        describe("will invoke the new registered factory to create a new feed, and the factory will", function () {
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
            expect(factoriesRegistry.decorateWithPlugins.calledWithExactly(result, bus)).to.be.ok();
          });
        });

        it("the new created feed will be returned", function () {
          expect(result).to.be(expectedResultingFeed);
        });
      });
    });
  });
});