"use strict";

var slice = Array.prototype.slice;

function newPluginMethod(chainable, bus, feedFactory) {
  return function () {
    return chainable.chain(feedFactory(bus, slice.call(arguments)));
  };
}

function FeedFactoriesRegistry() {
  var factories = {};
  this.factoryFor = function (name) {
    return factories[name];
  };
  this.registerFactoryFor = function (name, factory) {
    factories[name] = factory;
  };
  this.decorateWithPlugins = function (chainable, bus) {
    for (var name in factories) {
      if (factories.hasOwnProperty(name))
        chainable[name] = newPluginMethod(chainable, bus, factories[name]);
    }
    return chainable;
  };
}

function ExtensibleStateFactory() {
  var plugins={};

  function makeStateFactoryWithOutputBindedTo(output) {
    return function factory(name, opts) {
      return plugins[name](output, factory, opts);
    };
  }

  this.registerPlugin= function (name, plugin) {
    plugins[name] = plugin;
  };

  this.makeStateFor=function(name, output, opts) {
    var plugin = plugins[name];

    if (typeof plugin !== 'function')
      return;

    return plugin(output, makeStateFactoryWithOutputBindedTo(output), opts);
  };
}

module.exports = {
  feedFactoriesRegistry:function () {
    return new FeedFactoriesRegistry();
  },
  stateFactory:function () {
    return new ExtensibleStateFactory();
  }
};