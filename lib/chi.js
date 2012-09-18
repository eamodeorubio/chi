"use strict";

var utils = require('./internal/utils');

function Emitter() {
  var eventBus = new utils.EventBus();

  function makePublisher(event) {
    return function (value) {
      eventBus.publish(event, value);
      return this;
    }
  }

  this.yield = makePublisher('yield');
  this.throw = makePublisher('throw');

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