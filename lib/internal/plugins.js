"use strict";

var feeds = require('./feeds')
    , registry = require('./plugins/registry');

function ExtensibleFeedFactory(factoriesRegistry, stateFactory, makeFeed) {
  function makeFeedFactoryFor(name) {
    return function (bus, opts) {
      return factoriesRegistry.decorateWithPlugins(makeFeed(bus, stateFactory.makeStateFor(name, bus.publish, opts)), bus);
    };
  }

  this.makeFeedFor = function (name, bus, opts) {
    var factory = factoriesRegistry.factoryFor(name);
    if (typeof factory !== 'function') {
      factory = makeFeedFactoryFor(name);
      factoriesRegistry.registerFactoryFor(name, factory);
    }
    return factory(bus, opts);
  };

  this.registerPlugin = stateFactory.registerPlugin.bind(stateFactory);
}

module.exports = {
  feedFactory:function () {
    return new ExtensibleFeedFactory(registry.feedFactoriesRegistry(), registry.stateFactory(), feeds.feed);
  }
};