"use strict";

var feeds = require('./feeds')
    , registry = require('./plugins/registry');

function PluginScope(factoriesRegistry, stateFactory, makeFeed) {
  function makeFeedFactoryFor(name) {
    return function (bus, opts) {
      return factoriesRegistry.decorateWithPlugins(makeFeed(bus, stateFactory.makeStateFor(name, bus.publish, opts)), bus);
    };
  }

  this.feedFactoryForPlugin = function (name) {
    var factory = factoriesRegistry.factoryFor(name);
    if (typeof factory !== 'function') {
      factory = makeFeedFactoryFor(name);
      factoriesRegistry.registerFactoryFor(name, factory);
    }
    return factory;
  };

  this.registerPlugin = stateFactory.registerPlugin.bind(stateFactory);
}

module.exports = {
  scope:function () {
    return new PluginScope(registry.feedFactoriesRegistry(), registry.stateFactory(), feeds.feed);
  }
};