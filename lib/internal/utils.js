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

module.exports.EventBus = function () {
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
};