"use strict";

var utils = require('./internal/utils');

function Emitter() {
  var eventBus = new utils.EventBus()
      , self = this
      , done = false
      , failed = false;

  function makePublisher(event) {
    return function (value) {
      if (done || failed)
        throw 'Cannot "' + event + '" when it is completed';
      eventBus.publish(event, value);
      return self;
    };
  }

  this.yield = makePublisher('yield');
  var thrower = makePublisher('throw');
  this.throw = function (error) {
    var r = thrower(error);
    failed = true;
    return r;
  };
  this.done = function () {
    if (failed)
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