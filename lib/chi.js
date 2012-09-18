"use strict";

var utils = require('./internal/utils');

function Emitter() {
  var eventBus = new utils.EventBus();

  this.yield = function (value) {
    eventBus.publish('yield', value);
    return this;
  };

  this.throw = function (error) {
    eventBus.publish('throw', error);
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