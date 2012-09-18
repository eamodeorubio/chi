"use strict";

var utils = require('./internal/utils');

function Emitter() {
  var eventBus = new utils.EventBus()
      , done = false
      , fail;

  this.yield = function (value) {
    if (done || fail)
      throw 'Cannot "yield" when it is completed';
    eventBus.publish('yield', value);
    return this;
  };

  this.throw = function (error) {
    if (done || (fail && fail !== error))
      throw 'Cannot "throw" when it is completed';
    if (!fail) {
      eventBus.publish('throw', error);
      fail = error;
    }
    return this;
  };

  this.done = function () {
    if (fail)
      throw 'Cannot "done" when it is completed';
    if (!done) {
      eventBus.publish('done');
      done = true;
    }
    return this;
  };

  this.chain = function (feed) {
    if (!utils.isFeed(feed))
      throw 'Only a proper feed object can be subscribed to events, it was:[(' + typeof feed + '):' + feed + ']';
    eventBus.subscribe(feed);
    return {
      chain:function (otherFeed) {
        return feed.chain(otherFeed);
      }
    };
  };
}

module.exports.emitter = function () {
  return new Emitter();
};