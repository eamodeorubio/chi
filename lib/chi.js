"use strict";

var busModule = require('./internal/bus')
    , feeds = require('./internal/feeds');

var slice = Array.prototype.slice;

function makeFactoryFor(pluginName) {
  return function () {
    var busType = 'emitter', opts, bus;
    if (typeof arguments[0] === 'boolean') {
      busType = arguments[0] ? 'storage' : 'emitter';
      opts = slice.call(arguments, 1);
    } else
      opts = slice.call(arguments);
    bus = busModule[busType]();
    return feeds.feed(bus, feeds.initialStateFor(pluginName, bus, opts));
  };
}

var self = module.exports = {
  emitter:function () {
    var emitter = new busModule.emitter();
    return feeds.feed(emitter, feeds.yieldingState(emitter));
  },
  list:function () {
    var storage = new busModule.storage();
    return feeds.feed(storage, feeds.yieldingState(storage));
  },
  registerPlugin:function (name, plugin) {
    feeds.registerPlugin(name, plugin);
    self[name] = makeFactoryFor(name);
  }
};