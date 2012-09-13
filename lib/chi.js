"use strict";

function Emitter() {
  var chainedFeeds = [];

  this.yield = function (value) {
    var numberOfFeeds = chainedFeeds.length;
    for (var i = 0; i < numberOfFeeds; i++)
      chainedFeeds[i].yield(value);
  };
  this.chain = function (feed) {
    if (chainedFeeds.indexOf(feed) != -1)
      return;
    chainedFeeds.push(feed);
  };
}

module.exports.emitter = function () {
  return new Emitter();
};