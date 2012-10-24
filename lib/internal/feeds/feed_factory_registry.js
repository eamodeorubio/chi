"use strict";

var newPluginMethod = (function () {
  var toArray = Function.prototype.call.bind(Array.prototype.slice);

  return function(chainable, bus, feedFactory) {
    return function (/*opts...*/) {
      return chainable.chain(feedFactory(bus, toArray(arguments)));
    };
  };
}());

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

module.exports = {
  feedFactoriesRegistry:function () {
    return new FeedFactoriesRegistry();
  }
};