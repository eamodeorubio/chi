"use strict";

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
  feed:function (bus, initialState, optFeedCheck) {
    return new Feed(bus, initialState, typeof optFeedCheck === 'function' ? optFeedCheck : self.isFeed);
  },
  registerPlugin:function (name, plugin) {

  },
  isFeed:function (feed) {
    return feed &&
        typeof feed.yields === 'function' &&
        typeof feed.throws === 'function' &&
        typeof feed.done === 'function' &&
        typeof feed.chain === 'function';
  }
};