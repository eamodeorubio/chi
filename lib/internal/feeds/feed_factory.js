"use strict";

var feeds = require('./feed')
    , stateFactoryModule = require('./../states/state_factory')
    , feedFactoryModule = require('./feed_factory_registry');

function ExtensibleFeedFactory(factoriesRegistry, stateFactory, makeFeed) {
  function makeFeedFactoryFor(name) {
    return function (bus, opts) {
      return factoriesRegistry.decorateWithPlugins(makeFeed(bus, stateFactory.makeStateFor(name, bus.publish, opts)), bus);
    };
  }

  this.makeFeedFor = function (name, bus, opts) {
    return factoriesRegistry.factoryFor(name)(bus, opts);
  };

  this.registerPlugin = function (name, plugin) {
    stateFactory.registerPlugin(name, plugin);
    factoriesRegistry.registerFactoryFor(name, makeFeedFactoryFor(name));
  };
}

module.exports = {
  feedFactory:function () {
    return new ExtensibleFeedFactory(feedFactoryModule.feedFactoriesRegistry(), stateFactoryModule.stateFactory(), feeds.feed);
  }
};