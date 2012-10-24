"use strict";

var busModule = require('./internal/bus');

var makeFactoryFor = (function () {
  var toArray = Function.prototype.call.bind(Array.prototype.slice);

  return function(name, makeFeedFor) {
    return function (/* [hasMemory], opts... */) {
      var busType = 'emitter', opts;
      if (typeof arguments[0] === 'boolean') {
        busType = arguments[0] ? 'storage' : 'emitter';
        opts = toArray(arguments, 1);
      } else
        opts = toArray(arguments);
      return makeFeedFor(name, busModule[busType](), opts);
    };
  };
}());

function Chi(feedFactory) {
  var me = this;

  this.emitter = function () {
    return me.unit(false);
  };

  this.list = function () {
    return me.unit(true);
  };

  this.registerPlugin = (function () {
    var makeFeedFor = feedFactory.makeFeedFor.bind(feedFactory);

    return function (name, plugin) {
      feedFactory.registerPlugin(name, plugin);
      me[name] = makeFactoryFor(name, makeFeedFor);
    };
  }());
}

module.exports = {
  make:function () {
    return new Chi(require('./internal/feeds/feed_factory').feedFactory());
  }
};