"use strict";

var plugins = {}
    , factoriesRegistry
    , feeds = require('./feeds')
    , registry = require('./plugins/registry')
    , self;

function makeFeedFactoryFor(name) {
  return function (makeBus, opts) {
    return factoriesRegistry.decorateWithPlugins(feeds.feed(makeBus, self.stateFactory(name, opts)), makeBus);
  };
}

function stateFactoryWithOutputBindedTo(output) {
  return function factory(name, opts) {
    return plugins[name](output, factory, opts);
  };
}

function stateFactoryForPlugin(plugin, opts) {
  return function (output) {
    return plugin(output, stateFactoryWithOutputBindedTo(output), opts);
  };
}

self = module.exports = {
  feedFactoryForPlugin:function (name) {
    if (!factoriesRegistry)
      factoriesRegistry = registry.factoriesRegistry();
    var factory = factoriesRegistry.factoryFor(name);
    if (typeof factory !== 'function') {
      factory = makeFeedFactoryFor(name);
      factoriesRegistry.registerFactoryFor(name, factory);
    }
    return factory;
  },
  stateFactory:function (name, opts) {
    // This should be private!!!!!
    var plugin = plugins[name];
    if (typeof plugin !== 'function')
      return;
    return stateFactoryForPlugin(plugin, opts);
  },
  registerPlugin:function (name, plugin) {
    plugins[name] = plugin;
  }
};