"use strict";

var busModule = require('./internal/bus')
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

var self = module.exports = {
  emitter:function () {
    return self.unit(false);
  },
  list:function () {
    return self.unit(true);
  },
  registerPlugin:function (name, plugin) {
    plugins.registerPlugin(name, plugin);
    self[name] = makeFactoryFor(plugins.feedFactoryForPlugin(name));
  }
};

// Register internal plugins
require('./internal/plugins/failed')(self);
require('./internal/plugins/success')(self);
require('./internal/plugins/unit')(self);