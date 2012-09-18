"use strict";

function isFeed(feed) {
  return feed && typeof feed.yield === 'function' && typeof feed.chain === 'function';
}

function safeNotification(feed, event, data) {
  try {
    feed[event](data);
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

  this.publish = function (event, data) {
    var numberOfFeeds = feeds.length;
    for (var i = 0; i < numberOfFeeds; i++)
      safeNotification(feeds[i], event, data);
  };
};