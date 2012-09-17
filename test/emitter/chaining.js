"use strict";

var expect = require('expect.js'),
    doubles = require('../doubles'),
    chi = require('../../lib/chi');

describe('An Emitter can be chained:', function () {
  var anEmitter;

  beforeEach(function () {
    anEmitter = chi.emitter();
  });

  it('it has a chain() method', function () {
    expect(anEmitter.chain).to.be.a('function');
  });

  describe('when chain is invoked with another feed,', function () {
    var aFeed, chainResult;
    beforeEach(function () {
      aFeed = doubles.makeFeed();

      chainResult = anEmitter.chain(aFeed);
    });

    it('it will return a non null object', function () {
      expect(chainResult).to.be.an('object');
      expect(chainResult).not.to.be(null);
    });

    it('the object returned will have a chain() method', function () {
      expect(chainResult.chain).to.be.a('function');
    });

    it("the returned object's chain() method will, delegate to the chained feed's chain() method", function () {
      var expectedArgument = "some argument";
      var expectedResult = "returned value from chained feed's chain() method"

      aFeed.chain.withArgs(expectedArgument).returns(expectedResult);

      var result = chainResult.chain(expectedArgument);

      expect(aFeed.chain.calledOnce).to.be.ok();
      expect(result).to.be(expectedResult);
    });
  });
});