"use strict";

var busModule = require('./internal/bus')
    , feeds = require('./internal/feeds')
    , states = require('./internal/states')
    , slice = Array.prototype.slice;

function makeFactoryFor(pluginName) {
  return function () {
    var busType = 'emitter', opts;
    if (typeof arguments[0] === 'boolean') {
      busType = arguments[0] ? 'storage' : 'emitter';
      opts = slice.call(arguments, 1);
    } else
      opts = slice.call(arguments);
    return feeds.feed(busModule[busType], states.stateFactory(pluginName, opts));
  };
}

var self = module.exports = {
  emitter:function () {
    return feeds.feed(busModule.emitter, states.stateFactory('unit'));
  },
  list:function () {
    return feeds.feed(busModule.storage, states.stateFactory('unit'));
  },
  registerPlugin:function (name, plugin) {
    states.registerPlugin(name, plugin);
    self[name] = makeFactoryFor(name);
  }
};