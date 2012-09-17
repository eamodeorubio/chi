"use strict";

function isFeed(feed) {
  return feed && typeof feed.yield === 'function' && typeof feed.chain === 'function';
}

function safeYieldNotification(feed, value) {
  try {
    feed.yield(value);
  } catch (err) {
    // Ignore??? Really????
  }
}

function EventBus() {
  var feeds = [];

  this.subscribe = function (feed) {
    if (!isFeed(feed))
      throw 'Only a proper feed object can be subscribed to events, it was:[(' + typeof feed + ')' + feed + ']';
    if (feeds.indexOf(feed) != -1)
      return;
    feeds.push(feed);
  }

  this.publishYield = function (value) {
    var numberOfFeeds = feeds.length;
    for (var i = 0; i < numberOfFeeds; i++)
      safeYieldNotification(feeds[i], value);
  }
}

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