"use strict";

var busModule = require('./internal/bus')
    , pluginsModule = require('./internal/plugins')
    , slice = Array.prototype.slice;

function makeFactoryFor(name, makeFeedFor) {
  return function (/* [hasMemory], opts... */) {
    var busType = 'emitter', opts;
    if (typeof arguments[0] === 'boolean') {
      busType = arguments[0] ? 'storage' : 'emitter';
      opts = slice.call(arguments, 1);
    } else
      opts = slice.call(arguments);
    return makeFeedFor(name, busModule[busType](), opts);
  };
}

function Chi(feedFactory) {
  var me = this;

  this.emitter = function () {
    return me.unit(false);
  };

  this.list = function () {
    return me.unit(true);
  };

  this.registerPlugin = (function() {
    var makeFeedFor=feedFactory.makeFeedFor.bind(feedFactory);

    return function (name, plugin) {
      feedFactory.registerPlugin(name, plugin);
      me[name] = makeFactoryFor(name, makeFeedFor);
    };
  }());
}

module.exports = {
  make:function () {
    return new Chi(pluginsModule.feedFactory());
  }
};