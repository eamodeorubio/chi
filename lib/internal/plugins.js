"use strict";

var feeds = require('./feeds')
    , registry = require('./plugins/registry');

function PluginScope(factoriesRegistry, makeFeed) {
  var plugins = {}, me = this;

  function makeFeedFactoryFor(name) {
    return function (makeBus, opts) {
      return factoriesRegistry.decorateWithPlugins(makeFeed(makeBus, me.stateFactory(name, opts)), makeBus);
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

  this.feedFactoryForPlugin = function (name) {
    var factory = factoriesRegistry.factoryFor(name);
    if (typeof factory !== 'function') {
      factory = makeFeedFactoryFor(name);
      factoriesRegistry.registerFactoryFor(name, factory);
    }
    return factory;
  };

  this.stateFactory = function (name, opts) {
    // This should be private!!!!!
    var plugin = plugins[name];
    if (typeof plugin !== 'function')
      return;
    return stateFactoryForPlugin(plugin, opts);
  };

  this.registerPlugin = function (name, plugin) {
    plugins[name] = plugin;
  };
}

module.exports = {
  scope:function () {
    return new PluginScope(registry.factoriesRegistry(), feeds.feed);
  }
};