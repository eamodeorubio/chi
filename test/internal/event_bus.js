"use strict";

var expect = require('expect.js'),
    doubles = require('../doubles'),
    EventBus = require('../../lib/internal/utils');

describe('An EventBus:', function () {
  var eventBus;

  beforeEach(function () {
    eventBus = new EventBus();
  });

  it('it has a subscribe() method', function () {
    expect(eventBus.subscribe).to.be.a('function');
  });

  describe('subscribe() will throw if passed a non feed object:', function () {
    it('a null is not a feed', function () {
      expect(function () {
        eventBus.subscribe(null);
      }).to.throwError();
    });
    it('an object with only a chain method is not a feed', function () {
      expect(function () {
        eventBus.subscribe({
          chain:function () {
          }
        });
      }).to.throwError();
    });
    it('an object with only a yield method is not a feed', function () {
      expect(function () {
        eventBus.subscribe({
          'yield':function () {
          }
        });
      }).to.throwError();
    });
  });

  it('it has a publishYield() method', function () {
    expect(eventBus.publishYield).to.be.a('function');
  });

  describe('given several feeds has been subscribed to it', function () {
    var feed1, feed2, value;

    beforeEach(function () {
      value = "yielded value";

      feed1 = doubles.makeFeed();
      feed2 = doubles.makeFeed();

      eventBus.subscribe(feed1);
      eventBus.subscribe(feed2);
    });

    describe('when publishYield is invoked with a value, it', function () {
      var result;

      beforeEach(function () {
        result = eventBus.publishYield(value);
      });

      it('will return nothing', function () {
        expect(result).to.be(undefined);
      });

      it('will call yield on all subscribed feeds exactly one time', function () {
        expect(feed1.yield.calledOnce).to.be.ok();
        expect(feed2.yield.calledOnce).to.be.ok();
      });

      it('will pass the same argument to all subscribed feeds', function () {
        expect(feed1.yield.calledWithExactly(value)).to.be.ok();
        expect(feed2.yield.calledWithExactly(value)).to.be.ok();
      });
    });

    describe('when publishYield is invoked and one of the subscribed feeds throws an exception, it', function () {
      beforeEach(function () {
        feed1.yield.throws();
      });

      it('will still call yield on the other feeds', function () {
        eventBus.publishYield(value);

        expect(feed2.yield.called).to.be.ok();
      });
    });
  });

  describe('given the same feed has beed subscribed several times', function () {
    var aFeed;
    beforeEach(function () {
      aFeed = doubles.makeFeed();

      eventBus.subscribe(aFeed);
      eventBus.subscribe(aFeed);
      eventBus.subscribe(aFeed);
    });

    it('when publishYield is invoked, it will still call yield on the subscribed feed exactly one time', function () {
      eventBus.publishYield("not important");

      expect(aFeed.yield.calledOnce).to.be.ok();
    });
  });
});