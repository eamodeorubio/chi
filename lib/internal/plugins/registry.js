"use strict";

var slice = Array.prototype.slice;

function newPluginMethod(chainable, makeBus, feedFactory) {
  return function () {
    return chainable.chain(feedFactory(makeBus, slice.call(arguments)));
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
  this.decorateWithPlugins = function (chainable, makeBus) {
    for (var name in factories) {
      if (factories.hasOwnProperty(name))
        chainable[name] = newPluginMethod(chainable, makeBus, factories[name]);
    }
    return chainable;
  };
}

function StateFactoriesRegistry() {
  var factories={};

  function bindOptionsAndFutureOutputFor(stateFactory, opts) {
    return function (output) {
      return stateFactory(output, makeStateFactoryWithOutputBindedTo(output), opts);
    };
  }

  function makeStateFactoryWithOutputBindedTo(output) {
    return function factory(name, opts) {
      return factories[name](output, factory, opts);
    };
  }

  this.registerFactoryFor = function (name, plugin) {
    factories[name] = plugin;
  };
  this.factoryFor=function(name, opts) {
    var stateFactory = factories[name];

    if (typeof stateFactory !== 'function')
      return;

    return bindOptionsAndFutureOutputFor(stateFactory, opts);
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