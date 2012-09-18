"use strict";

function isFeed(feed) {
  return feed && typeof feed.yield === 'function' && typeof feed.chain === 'function' && typeof feed.throw === 'function';
}

function safeNotification(target, event, data) {
  try {
    target[event](data);
  } catch (err) {
    // Ignore??? Really????
  }
}

module.exports.EventBus = function () {
  var subscriptors = [];

  this.subscribe = function (subscriptor) {
    if (subscriptors.indexOf(subscriptor) != -1)
      return;
    subscriptors.push(subscriptor);
  }

  this.publish = function (event, data) {
    var numberOfFeeds = subscriptors.length;
    for (var i = 0; i < numberOfFeeds; i++)
      safeNotification(subscriptors[i], event, data);
  };
};

module.exports.isFeed = isFeed;