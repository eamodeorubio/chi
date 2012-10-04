"use strict";

var plugins = {}
    , feeds = require('./feeds')
    , factories = require('./plugins/registry')()
    , self;

function makeFeedFactoryFor(name) {
  return function (makeBus, opts) {
    return factories.decorateWithPlugins(feeds.feed(makeBus, self.stateFactory(name, opts)), makeBus);
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
    var factory = factories.factoryFor(name);
    if (typeof factory !== 'function') {
      factory = makeFeedFactoryFor(name);
      factories.registerFactoryFor(name, factory);
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