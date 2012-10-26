"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    feeds = require('../../../lib/internal/feeds/feed');

describe('isChainable():', function () {
  it('a null is not a feed', function () {
    expect(feeds.isChainable(null)).not.to.be.ok();
  });

  function objectWithoutThisMethodIsNotAFeed(methodName) {
    it('an object with no "' + methodName + '" method is not a feed', function () {
      var almostAFeed = doubles.makeFeed();
      delete almostAFeed[methodName];

      expect(feeds.isChainable(almostAFeed)).not.to.be.ok();
    });
  }

  ['yields', 'throws', 'done'].forEach(objectWithoutThisMethodIsNotAFeed);

  it('an object with "yield", "throw" and "done" methods is a feed', function () {
    expect(feeds.isChainable(doubles.makeChainable())).to.be.ok();
  });
});