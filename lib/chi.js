"use strict";

var busModule = require('./internal/bus');

var makeFactoryFor = (function () {
  var toArray = Function.prototype.call.bind(Array.prototype.slice);

  return function (name, makeFeedFor) {
    return function (/* [hasMemory], opts... */) {
      var busType = 'makeBus', opts;
      if (typeof arguments[0] === 'boolean') {
        busType = arguments[0] ? 'makeBusWithMemory' : busType;
        opts = toArray(arguments, 1);
      } else
        opts = toArray(arguments);
      return makeFeedFor(name, busModule[busType](), opts);
    };
  };
}());

function Chi(feedFactory) {
  var me = this;

  this.emitter = function () {
    return me.unit(false);
  };

  this.list = function () {
    return me.unit(true);
  };

  this.registerPlugin = (function () {
    var makeFeedFor = feedFactory.makeFeedFor.bind(feedFactory);

    return function (name, plugin) {
      if (!name || typeof name !== 'string')
        throw 'Expected a non empty string as name of the plugin, it was:' + name;
      if (!plugin || typeof plugin !== 'function')
        throw 'Expected a function as a plugin, it was:' + plugin;
      if (me[name])
        throw 'A plugin called "' + name + '" has been already registered';
      try {
        feedFactory.registerPlugin(name, plugin);
        me[name] = makeFactoryFor(name, makeFeedFor);
      } catch (err) {
        throw "Error, cannot register plugin '" + name + "'. Reason: " + err;
      }
    };
  }());
}

module.exports = {
  make:function () {
    return new Chi(require('./internal/feeds/feed_factory').feedFactory());
  }
};