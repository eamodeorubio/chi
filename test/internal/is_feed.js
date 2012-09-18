"use strict";

var expect = require('expect.js'),
    doubles = require('../doubles'),
    utils = require('../../lib/internal/utils');

describe('isFeed():', function () {
  it('a null is not a feed', function () {
    expect(utils.isFeed(null)).not.to.be.ok();
  });

  function objectWithoutThisMethodIsNotAFeed(methodName) {
    it('an object with no "' + methodName + '" method is not a feed', function () {
      var almostAFeed = doubles.makeFeed();
      delete almostAFeed[methodName];

      expect(utils.isFeed(almostAFeed)).not.to.be.ok();
    });
  }

  ['yield', 'throw', 'done', 'chain'].forEach(objectWithoutThisMethodIsNotAFeed);

  it('an object with "yield", "throw", "done" and "chain" method is a feed', function () {
    expect(utils.isFeed(doubles.makeFeed())).to.be.ok();
  });
});