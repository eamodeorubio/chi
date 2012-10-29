"use strict";

function makeFeed(bus, initialState, isFeed) {
  var me = {},
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

  me.chain = function (chainable) {
    if (!isFeed(chainable))
      throw 'Only a proper feed object can be subscribed to events, it was:[(' + typeof chainable + '):' + chainable + ']';
    bus.subscribe(chainable);
    return makeChain(chainable);
  };

  return me;
}

var self = module.exports = {
  feed:function (bus, state, optFeedCheck) {
    return makeFeed(bus, state, typeof optFeedCheck === 'function' ? optFeedCheck : self.isChainable);
  },
  isChainable:function (obj) {
    return obj &&
        typeof obj.yields === 'function' &&
        typeof obj.throws === 'function' &&
        typeof obj.done === 'function';
  }
};