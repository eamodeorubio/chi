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

module.exports = {
  factoriesRegistry:function () {
    return new FactoriesRegistry();
  }
};