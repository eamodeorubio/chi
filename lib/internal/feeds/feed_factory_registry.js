"use strict";

var newPluginMethod = (function () {
  var toArray = Function.prototype.call.bind(Array.prototype.slice);

  return function (chainable, bus, feedFactory) {
    return function (/*opts...*/) {
      return chainable.chain(feedFactory(bus, toArray(arguments)));
    };
  };
}());

module.exports = {
  feedFactoriesRegistry:function () {
    var me = {},
        factories = {};

    me.factoryFor = function (name) {
      return factories[name];
    };
    me.registerFactoryFor = function (name, factory) {
      factories[name] = factory;
    };
    me.decorateWithPlugins = function (chainable, bus) {
      for (var name in factories) {
        if (factories.hasOwnProperty(name))
          chainable[name] = newPluginMethod(chainable, bus, factories[name]);
      }
      return chainable;
    };

    return me;
  }
};