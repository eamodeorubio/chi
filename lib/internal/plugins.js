"use strict";

var feeds = require('./feeds')
    , registry = require('./plugins/registry');

function PluginScope(factoriesRegistry, pluginsRegistry, makeFeed) {
  function makeFeedFactoryFor(name) {
    return function (makeBus, opts) {
      return factoriesRegistry.decorateWithPlugins(makeFeed(makeBus, pluginsRegistry.factoryFor(name, opts)), makeBus);
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

  this.registerPlugin = pluginsRegistry.registerPlugin.bind(pluginsRegistry);
}

module.exports = {
  scope:function () {
    return new PluginScope(registry.factoriesRegistry(), registry.pluginsRegistry(), feeds.feed);
  }
};