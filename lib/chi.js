"use strict";

var EventBus = require('./internal/utils');

function Emitter() {
  var eventBus = new EventBus();

  this.yield = function (value) {
    eventBus.publishYield(value);
    return this;
  };

  this.chain = function (feed) {
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