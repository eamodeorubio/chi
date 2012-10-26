"use strict";

var expect = require('expect.js'),
    sinon = require('sinon'),
    doubles = require('../../helpers/doubles'),
    feeds = require('../../../lib/internal/feeds/feed');

describe('A Feed can be chained:', function () {
  var feed, bus, initialState, isChainable;

  beforeEach(function () {
    bus = doubles.makeBus();

    initialState = doubles.makeFeedState();

    isChainable = doubles.stubFunction();

    feed = feeds.feed(bus, initialState, isChainable);
  });

  it('it has a chain() method', function () {
    expect(feed.chain).to.be.a('function');
  });

  it('chain() will throw if isChainable returns false:', function () {
    isChainable.returns(false);

    expect(function () {
      feed.chain(doubles.makeFeed());
    }).to.throwError();
  });

  describe('when chain is invoked with a chainable object,', function () {
    var chainable, chain;
    beforeEach(function () {
      isChainable.returns(true);
      chainable = doubles.makeChainable();

      sinon.stub(feed, 'yields');
      sinon.stub(feed, 'throws');
      sinon.stub(feed, 'done');

      chain = feed.chain(chainable);
    });

    afterEach(function () {
      feed.yields.restore();
      feed.throws.restore();
      feed.done.restore();
    });

    it('will subscribe the feed to the bus', function () {
      expect(bus.subscribe.calledOnce).to.be.ok();
      expect(bus.subscribe.calledOn(bus)).to.be.ok();
      expect(bus.subscribe.calledWithExactly(chainable)).to.be.ok();
    });

    it('it will return a non null chain object', function () {
      expect(chain).to.be.an('object');
      expect(chain).not.to.be(null);
    });

    it('the returned chain will not have a chain() method', function () {
      expect(chain.chain).to.be(undefined);
    });

    function willDelegateToTheFeed(methodName) {
      it('the returned chain will have a ' + methodName + '() method', function () {
        expect(chain[methodName]).to.be.a('function');
      });

      describe('the returned chain ' + methodName + '() method will delegate to this feed ' + methodName + '() method:', function () {
        var param, result, expectedResult;
        beforeEach(function () {
          feed[methodName].returns(expectedResult);

          result = chain[methodName](param);
        });

        it('it will call once the method on the delegate', function () {
          expect(feed[methodName].calledOnce).to.be.ok();
          expect(feed[methodName].calledOn(feed)).to.be.ok();
        });

        it('it will call the method on the delegate with the same parameters', function () {
          expect(feed[methodName].calledWithExactly(param)).to.be.ok();
        });

        it('it will return the value returned by the delegate method', function () {
          expect(result).to.be(expectedResult);
        });
      });
    }

    ['yields', 'throws', 'done'].forEach(willDelegateToTheFeed);
  });

  it('chain() will throw if bus.subscribe() throws', function () {
    isChainable.returns(true);
    bus.subscribe.throws();

    expect(function () {
      feed.chain("some object");
    }).to.throwError();
  });

  describe('when chain is invoked with a feed,', function () {
    var aFeed, chain;
    beforeEach(function () {
      isChainable.returns(true);
      aFeed = doubles.makeFeed();

      chain = feed.chain(aFeed);
    });

    it('the object returned will have a chain() method', function () {
      expect(chain.chain).to.be.a('function');
    });

    describe("the returned object's chain() method will delegate to the chained feed's chain() method", function () {
      var result, expectedResult, expectedArgument;

      beforeEach(function () {
        expectedArgument = 'some argument';
        expectedResult = "returned value from chained feed's chain() method";

        aFeed.chain.returns(expectedResult);

        result = chain.chain(expectedArgument);
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
});
