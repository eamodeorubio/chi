"use strict";

var busModule = require('./internal/bus')
    , feeds = require('./internal/feeds')
    , plugins = require('./internal/plugins')
    , slice = Array.prototype.slice;

function makeFactoryFor(makeFeed) {
  return function (/* [hasMemory], opts... */) {
    var busType = 'emitter', opts;
    if (typeof arguments[0] === 'boolean') {
      busType = arguments[0] ? 'storage' : 'emitter';
      opts = slice.call(arguments, 1);
    } else
      opts = slice.call(arguments);
    return makeFeed(busModule[busType], opts);
  };
}

function feedFactoryForPlugin(name) {
  return function (makeBus, opts) {
    return feeds.feed(makeBus, plugins.stateFactory(name, opts));
  };
}

var self = module.exports = {
  emitter:function () {
    return self.unit(false);
  },
  list:function () {
    return self.unit(true);
  },
  registerPlugin:function (name, plugin) {
    plugins.registerPlugin(name, plugin);
    var makeFeed = feedFactoryForPlugin(name);
    feeds.registerPlugin(name, makeFeed);
    self[name] = makeFactoryFor(makeFeed);
  }
};

// Register internal plugins
require('./internal/plugins/failed')(self);
require('./internal/plugins/success')(self);
require('./internal/plugins/unit')(self);