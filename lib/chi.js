"use strict";

var busModule = require('./internal/bus')
    , pluginsModule = require('./internal/plugins')
    , slice = Array.prototype.slice;

function makeFactoryFor(makeFeed) {
  return function (/* [hasMemory], opts... */) {
    var busType = 'emitter', opts;
    if (typeof arguments[0] === 'boolean') {
      busType = arguments[0] ? 'storage' : 'emitter';
      opts = slice.call(arguments, 1);
    } else
      opts = slice.call(arguments);
    return makeFeed(busModule[busType](), opts);
  };
}

function Chi(plugins) {
  var me = this;

  this.emitter = function () {
    return me.unit(false);
  };

  this.list = function () {
    return me.unit(true);
  };

  this.registerPlugin = function (name, plugin) {
    plugins.registerPlugin(name, plugin);
    me[name] = makeFactoryFor(plugins.feedFactoryForPlugin(name));
  };
}

module.exports = {
  make:function () {
    return new Chi(pluginsModule.scope());
  }
};