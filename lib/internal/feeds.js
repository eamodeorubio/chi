"use strict";

var plugins = {}
    , slice = Array.prototype.slice;

function pluggedMethod(feed, busFactory, plugin) {
  return function () {
    feed.chain(plugin(busFactory, slice.call(arguments)));
  };
}

function decorateWithPlugins(feed, busFactory) {
  for (var name in plugins) {
    if (plugins.hasOwnProperty(name))
      feed[name] = pluggedMethod(feed, busFactory, plugins[name]);
  }
  return feed;
}

function Feed(busFactory, stateFactory, isFeed) {
  var bus = busFactory()
      , currentState = stateFactory(bus)
      , me = this;

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
  feed:function (busFactory, stateFactory, optFeedCheck) {
    return decorateWithPlugins(new Feed(busFactory, stateFactory, typeof optFeedCheck === 'function' ? optFeedCheck : self.isFeed), busFactory);
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