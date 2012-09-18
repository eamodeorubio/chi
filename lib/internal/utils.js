"use strict";

function isFeed(feed) {
  return feed
      && typeof feed.yield === 'function'
      && typeof feed.throw === 'function'
      && typeof feed.done === 'function'
      && typeof feed.chain === 'function';
}

function safeNotification(event, data) {
  return function (target) {
    try {
      target[event](data);
    } catch (err) {
      // Ignore??? Really????
    }
  };
}

module.exports.EventBus = function () {
  var subscriptors = [], publications = [];

  this.subscribe = function (subscriptor) {
    if (subscriptors.indexOf(subscriptor) != -1)
      return;
    subscriptors.push(subscriptor);
    var numberOfPublications = publications.length;
    for (var i = 0; i < numberOfPublications; i++)
      publications[i](subscriptor);
  };

  this.publish = function (event, data) {
    var notification = safeNotification(event, data);
    publications.push(notification);
    var numberOfFeeds = subscriptors.length;
    for (var i = 0; i < numberOfFeeds; i++)
      notification(subscriptors[i]);
  };
};

module.exports.isFeed = isFeed;