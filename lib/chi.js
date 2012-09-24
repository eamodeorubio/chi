"use strict";

var busModule = require('./internal/bus')
    , feeds = require('./internal/feeds');

var slice = Array.prototype.slice;

function makeFactoryFor(pluginName) {
  return function () {
    var bus = new busModule.EventBus(), notificationType = 'fire', args;
    if (typeof arguments[0] === 'boolean') {
      notificationType = arguments[0] ? 'publish' : 'fire';
      args = slice.call(arguments, 1);
    } else
      args = slice.call(arguments);
    return feeds.feed(bus, feeds.initialStateFor(pluginName, bus, notificationType, args));
  };
}

var self = module.exports = {
  emitter:function () {
    var bus = new busModule.EventBus();
    return feeds.feed(bus, feeds.yieldingState(bus, 'fire'));
  },
  list:function () {
    var bus = new busModule.EventBus();
    return feeds.feed(bus, feeds.yieldingState(bus, 'publish'));
  },
  registerPlugin:function (name, plugin) {
    feeds.registerPlugin(name, plugin);
    self[name] = makeFactoryFor(name);
  }
};