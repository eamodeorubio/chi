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

    describe("the returned object's chain() method will call the chained feed's chain() method", function () {
      var result, expectedResult, expectedArgument;

      beforeEach(function () {
        expectedArgument = 'some argument';
        expectedResult = "returned value from chained feed's chain() method";

        aFeed.chain.returns(expectedResult);

        result = chainResult.chain(expectedArgument);
      });

      it('only once', function () {
        expect(aFeed.chain.calledOnce).to.be.ok();
      });

      it('using the chained feed as the runtime context', function () {
        expect(aFeed.chain.calledOn(aFeed)).to.be.ok();
      });

      it('using the same argument passed', function () {
        expect(aFeed.chain.calledWithExactly(expectedArgument)).to.be.ok();
      });

      it('and will return the resulting value', function () {
        expect(result).to.be(expectedResult);
      });
    });
  });

  describe('chain() will throw if passed a non feed object:', function () {
    it('a null is not a feed', function () {
      expect(function () {
        anEmitter.chain(null);
      }).to.throwError();
    });
    it('an object with only a chain method is not a feed', function () {
      expect(function () {
        anEmitter.chain({
          chain:function () {
          }
        });
      }).to.throwError();
    });
  });
});