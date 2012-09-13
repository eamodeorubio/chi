"use strict";

function Emitter() {
  var chainedFeeds = [];

  this.yield = function (value) {
    var numberOfFeeds = chainedFeeds.length;
    for (var i = 0; i < numberOfFeeds; i++)
      chainedFeeds[i].yield(value);
  };

  this.chain = function (feed) {
    chainedFeeds.push(feed);
  };
}

module.exports.emitter = function () {
  return new Emitter();
};