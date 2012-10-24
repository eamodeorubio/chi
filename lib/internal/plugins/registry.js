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

function StateFactoriesRegistry() {
  var factories={};

  function makeStateFactoryWithOutputBindedTo(output) {
    return function factory(name, opts) {
      return factories[name](output, factory, opts);
    };
  }

  this.registerFactoryFor = function (name, plugin) {
    factories[name] = plugin;
  };

  this.makeStateFor=function(name, output, opts) {
    var makeState = factories[name];

    if (typeof makeState !== 'function')
      return;

    return makeState(output, makeStateFactoryWithOutputBindedTo(output), opts);
  };
}

module.exports = {
  feedFactoriesRegistry:function () {
    return new FeedFactoriesRegistry();
  },
  stateFactoriesRegistry:function () {
    return new StateFactoriesRegistry();
  }
};