"use strict";

var busModule = require('./internal/bus')
    , feeds = require('./internal/feeds')
    , states = require('./internal/states')
    , slice = Array.prototype.slice;

function makeFactoryFor(pluginName) {
  return function () {
    var busType = 'emitter', opts, bus;
    if (typeof arguments[0] === 'boolean') {
      busType = arguments[0] ? 'storage' : 'emitter';
      opts = slice.call(arguments, 1);
    } else
      opts = slice.call(arguments);
    bus = busModule[busType]();
    return feeds.feed(bus, states.stateFactoryWith(bus.publish)(pluginName, opts));
  };
}

var self = module.exports = {
  emitter:function () {
    var emitter = new busModule.emitter();
    return feeds.feed(emitter, states.stateFactoryWith(emitter.publish)('unit'));
  },
  list:function () {
    var storage = new busModule.storage();
    return feeds.feed(storage, states.stateFactoryWith(storage.publish)('unit'));
  },
  registerPlugin:function (name, plugin) {
    states.registerPlugin(name, plugin);
    self[name] = makeFactoryFor(name);
  }
};