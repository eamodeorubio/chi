"use strict";

var expect = require('expect.js'),
    doubles = require('../doubles'),
    utils = require('../../lib/internal/utils');

describe('An EventBus:', function () {
  var bus;

  beforeEach(function () {
    bus = new utils.EventBus();
  });

  it('it has a subscribe() method', function () {
    expect(bus.subscribe).to.be.a('function');
  });

  describe('subscribe() will throw if passed a non feed object:', function () {
    it('a null is not a feed', function () {
      expect(function () {
        bus.subscribe(null);
      }).to.throwError();
    });
    it('an object with only a chain method is not a feed', function () {
      expect(function () {
        bus.subscribe({
          chain:function () {
          }
        });
      }).to.throwError();
    });
    it('an object with only a yield method is not a feed', function () {
      expect(function () {
        bus.subscribe({
          'yield':function () {
          }
        });
      }).to.throwError();
    });
  });

  it('it has a publishYield() method', function () {
    expect(bus.publishYield).to.be.a('function');
  });

  describe('given several feeds has been subscribed to it', function () {
    var feed1, feed2, value, error;

    beforeEach(function () {
      value = 'yielded value';
      error = 'throwed error';

      feed1 = doubles.makeFeed();
      feed2 = doubles.makeFeed();

      bus.subscribe(feed1);
      bus.subscribe(feed2);
    });

    describe('when publishYield is invoked with a value, it', function () {
      var result;

      beforeEach(function () {
        result = bus.publishYield(value);
      });

      it('will return nothing', function () {
        expect(result).to.be(undefined);
      });

      it('will call yield on all subscribed feeds exactly one time', function () {
        expect(feed1.yield.calledOnce).to.be.ok();
        expect(feed1.yield.calledOn(feed1)).to.be.ok();

        expect(feed2.yield.calledOnce).to.be.ok();
        expect(feed2.yield.calledOn(feed2)).to.be.ok();
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
        bus.publishYield(value);

        expect(feed2.yield.called).to.be.ok();
      });
    });

    describe('when publishError is invoked with an error, it', function () {
      var result;

      beforeEach(function () {
        result = bus.publishError(error);
      });

      it('will return nothing', function () {
        expect(result).to.be(undefined);
      });

      it('will call throw on all subscribed feeds exactly one time', function () {
        expect(feed1.throw.calledOnce).to.be.ok();
        expect(feed1.throw.calledOn(feed1)).to.be.ok();

        expect(feed2.throw.calledOnce).to.be.ok();
        expect(feed2.throw.calledOn(feed2)).to.be.ok();
      });

      it('will pass the same argument to all subscribed feeds', function () {
        expect(feed1.throw.calledWithExactly(error)).to.be.ok();
        expect(feed2.throw.calledWithExactly(error)).to.be.ok();
      });
    });

    describe('when publishError is invoked and one of the subscribed feeds throws an exception, it', function () {
      beforeEach(function () {
        feed1.throw.throws();
      });

      it('will still call yield on the other feeds', function () {
        bus.publishError(error);

        expect(feed2.throw.called).to.be.ok();
      });
    });
  });

  describe('given the same feed has beed subscribed several times', function () {
    var aFeed;
    beforeEach(function () {
      aFeed = doubles.makeFeed();

      bus.subscribe(aFeed);
      bus.subscribe(aFeed);
      bus.subscribe(aFeed);
    });

    it('when publishYield is invoked, it will still call yield on the subscribed feed exactly one time', function () {
      bus.publishYield("not important");

      expect(aFeed.yield.calledOnce).to.be.ok();
    });

    it('when publishError is invoked, it will still call throw on the subscribed feed exactly one time', function () {
      bus.publishError("not important");

      expect(aFeed.throw.calledOnce).to.be.ok();
    });
  });
});