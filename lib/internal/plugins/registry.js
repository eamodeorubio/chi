"use strict";

var slice = Array.prototype.slice;

function newPluginMethod(chainable, makeBus, feedFactory) {
  return function () {
    return chainable.chain(feedFactory(makeBus, slice.call(arguments)));
  };
}

module.exports = function () {
  var factories = {};
  return {
    factoryFor:function (name) {
      return factories[name];
    },
    registerFactoryFor:function (name, factory) {
      factories[name] = factory;
    },
    decorateWithPlugins:function (chainable, makeBus) {
      for (var name in factories) {
        if (factories.hasOwnProperty(name))
          chainable[name] = newPluginMethod(chainable, makeBus, factories[name]);
      }
      return chainable;
    }
  };
};