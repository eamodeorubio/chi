"use strict";

var busModule = require('./internal/bus')
    , feeds = require('./internal/feeds');

function makeFactoryFor(pluginName) {
  return function (memorizeEvents) {
    var bus = new busModule.EventBus();
    return feeds.feed(bus, feeds.initialStateFor(pluginName, bus, memorizeEvents ? 'publish' : 'fire'));
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