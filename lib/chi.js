"use strict";

var utils = require('./internal/utils')
    , feeds = require('./internal/feeds.js');

module.exports.emitter = function () {
  var bus = new utils.EventBus();
  return feeds.feed(bus, feeds.yieldingState(bus, 'fire'));
};

module.exports.list = function () {
  var bus = new utils.EventBus();
  return feeds.feed(bus, feeds.yieldingState(bus, 'publish'));
};