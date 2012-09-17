"use strict";

function isFeed(feed) {
  return feed && typeof feed.yield === 'function' && typeof feed.chain === 'function';
}

function Emitter() {
  var chainedFeeds = [];

  function safeYieldNotification(feed, value) {
    try {
      feed.yield(value);
    } catch (err) {
      // Ignore??? Really????
    }
  }

  function addChainedFeed(feed) {
    if (!isFeed(feed))
      throw 'Only a proper feed object can be chained, it was:[(' + typeof feed + ')' + feed + ']';
    if (chainedFeeds.indexOf(feed) != -1)
      return;
    chainedFeeds.push(feed);
  }

  this.yield = function (value) {
    var numberOfFeeds = chainedFeeds.length;
    for (var i = 0; i < numberOfFeeds; i++)
      safeYieldNotification(chainedFeeds[i], value);
  };

  this.chain = function (feed) {
    addChainedFeed(feed);
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