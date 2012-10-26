"use strict";

function Feed(bus, initialState, isFeed) {
  var me = this,
      currentState = initialState,
      eventNames = ['yields', 'throws', 'done'];

  function publishMethodFor(event) {
    me[event] = function (data) {
      currentState = currentState[event](data);
      return me;
    };
  }

  function makeChain(chainable) {
    var chain = eventNames.reduce(function (chain, eventName) {
      chain[eventName] = me[eventName].bind(me);
      return chain;
    }, {});
    if (typeof chainable.chain === 'function')
      chain.chain = chainable.chain.bind(chainable);
    return chain;
  }

  eventNames.forEach(publishMethodFor);

  this.chain = function (chainable) {
    if (!isFeed(chainable))
      throw 'Only a proper feed object can be subscribed to events, it was:[(' + typeof chainable + '):' + chainable + ']';
    bus.subscribe(chainable);
    return makeChain(chainable);
  };
}

var self = module.exports = {
  feed:function (bus, state, optFeedCheck) {
    return new Feed(bus, state, typeof optFeedCheck === 'function' ? optFeedCheck : self.isChainable);
  },
  isChainable:function (feed) {
    return feed &&
        typeof feed.yields === 'function' &&
        typeof feed.throws === 'function' &&
        typeof feed.done === 'function';
  }
};