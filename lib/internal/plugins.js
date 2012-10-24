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
    return factoriesRegistry.factoryFor(name)(bus, opts);
  };

  this.registerPlugin = function (name, plugin) {
    stateFactory.registerPlugin(name, plugin);
    factoriesRegistry.registerFactoryFor(name, makeFeedFactoryFor(name));
  };
}

module.exports = {
  feedFactory:function () {
    return new ExtensibleFeedFactory(registry.feedFactoriesRegistry(), registry.stateFactory(), feeds.feed);
  }
};