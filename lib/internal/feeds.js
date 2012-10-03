"use strict";

var plugins = {}
    , slice = Array.prototype.slice;

function pluggedMethod(feed, makeBus, plugin) {
  return function () {
    return feed.chain(plugin(makeBus, slice.call(arguments)));
  };
}

function decorateWithPlugins(feed, makeBus) {
  for (var name in plugins) {
    if (plugins.hasOwnProperty(name))
      feed[name] = pluggedMethod(feed, makeBus, plugins[name]);
  }
  return feed;
}

function Feed(bus, initialState, isFeed) {
  var currentState = initialState, me = this;

  function publishMethodFor(event) {
    me[event] = function (data) {
      currentState = currentState[event](data);
      return me;
    };
  }

  ['yields', 'throws', 'done'].forEach(publishMethodFor);

  this.chain = function (feed) {
    if (!isFeed(feed))
      throw 'Only a proper feed object can be subscribed to events, it was:[(' + typeof feed + '):' + feed + ']';
    bus.subscribe(feed);
    return {
      chain:function (otherFeed) {
        return feed.chain(otherFeed);
      }
    };
  };
}

var self = module.exports = {
  feed:function (makeBus, makeState, optFeedCheck) {
    var bus = makeBus()
        , state = makeState(bus.publish)
        , feed = new Feed(bus, state, typeof optFeedCheck === 'function' ? optFeedCheck : self.isFeed);
    decorateWithPlugins(feed, makeBus);
    return feed;
  },
  registerPlugin:function (name, plugin) {
    plugins[name] = plugin;
  },
  isFeed:function (feed) {
    return feed &&
        typeof feed.yields === 'function' &&
        typeof feed.throws === 'function' &&
        typeof feed.done === 'function' &&
        typeof feed.chain === 'function';
  }
};