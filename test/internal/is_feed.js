"use strict";

var expect = require('expect.js'),
    doubles = require('../helpers/doubles'),
    feeds = require('../../lib/internal/feeds');

describe('isFeed():', function () {
  it('a null is not a feed', function () {
    expect(feeds.isFeed(null)).not.to.be.ok();
  });

  function objectWithoutThisMethodIsNotAFeed(methodName) {
    it('an object with no "' + methodName + '" method is not a feed', function () {
      var almostAFeed = doubles.makeFeed();
      delete almostAFeed[methodName];

      expect(feeds.isFeed(almostAFeed)).not.to.be.ok();
    });
  }

  ['yield', 'throw', 'done', 'chain'].forEach(objectWithoutThisMethodIsNotAFeed);

  it('an object with "yield", "throw", "done" and "chain" method is a feed', function () {
    expect(feeds.isFeed(doubles.makeFeed())).to.be.ok();
  });
});