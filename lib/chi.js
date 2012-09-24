"use strict";

var busModule = require('./internal/bus')
    , feeds = require('./internal/feeds');

module.exports = {
  emitter:function () {
    var bus = new busModule.EventBus();
    return feeds.feed(bus, feeds.yieldingState(bus, 'fire'));
  },
  list:function () {
    var bus = new busModule.EventBus();
    return feeds.feed(bus, feeds.yieldingState(bus, 'publish'));
  },
  registerPlugin:function (name, plugin) {
    this[name] = function () {
      var bus = new busModule.EventBus();
      return feeds.feed(bus, plugin());
    };
  }
};