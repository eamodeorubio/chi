"use strict";

var slice = Array.prototype.slice;

function newPluginMethod(chainable, makeBus, feedFactory) {
  return function () {
    return chainable.chain(feedFactory(makeBus, slice.call(arguments)));
  };
}

function FactoriesRegistry() {
  var factories = {};
  this.factoryFor = function (name) {
    return factories[name];
  };
  this.registerFactoryFor = function (name, factory) {
    factories[name] = factory;
  };
  this.decorateWithPlugins = function (chainable, makeBus) {
    for (var name in factories) {
      if (factories.hasOwnProperty(name))
        chainable[name] = newPluginMethod(chainable, makeBus, factories[name]);
    }
    return chainable;
  };
}

function PluginsRegistry() {
  var plugins={};

  function factoryForPlugin(plugin, opts) {
    return function (output) {
      return plugin(output, factoryWithOutputBindedTo(output), opts);
    };
  }

  function factoryWithOutputBindedTo(output) {
    return function factory(name, opts) {
      return plugins[name](output, factory, opts);
    };
  }

  this.registerPlugin = function (name, plugin) {
    plugins[name] = plugin;
  };

  this.factoryFor=function(name, opts) {
    var plugin = plugins[name];

    if (typeof plugin !== 'function')
      return;

    return factoryForPlugin(plugin, opts);
  };
}

module.exports = {
  factoriesRegistry:function () {
    return new FactoriesRegistry();
  },
  pluginsRegistry:function () {
    return new PluginsRegistry();
  }
};