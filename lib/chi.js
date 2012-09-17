"use strict";

function Emitter() {
  var chainedFeeds = [];

  function safeYieldNotification(feed, value) {
    try {
      feed.yield(value);
    } catch(err) {

    }
  }

  this.yield = function (value) {
    var numberOfFeeds = chainedFeeds.length;
    for (var i = 0; i < numberOfFeeds; i++)
      safeYieldNotification(chainedFeeds[i], value);
  };
  this.chain = function (feed) {
    if (chainedFeeds.indexOf(feed) != -1)
      return;
    chainedFeeds.push(feed);
    return {};
  };
}

module.exports.emitter = function () {
  return new Emitter();
};