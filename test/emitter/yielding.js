"use strict";

var expect = require('expect.js'),
    doubles = require('../doubles'),
    chi = require('../../lib/chi');

describe('An Emitter can yield values:', function () {
  var anEmmitter, value = "yielded value";

  beforeEach(function () {
    anEmmitter = chi.emitter();
  });

  it('it has a yield() method', function () {
    expect(anEmmitter.yield).to.be.a('function');
  });

  describe('given it is chained to several feeds', function () {
    var feed1, feed2;

    beforeEach(function () {
      feed1 = doubles.makeFeed();
      feed2 = doubles.makeFeed();

      anEmmitter.chain(feed1);
      anEmmitter.chain(feed2);
    });

    describe('when yield is invoked with a value, it', function () {
      beforeEach(function () {
        anEmmitter.yield(value);
      });

      it('will call yield on all chained feeds exactly one time', function () {
        expect(feed1.yield.calledOnce).to.be.ok();
        expect(feed2.yield.calledOnce).to.be.ok();
      });

      it('will pass the same argument to all chained feeds', function () {
        expect(feed1.yield.calledWithExactly(value)).to.be.ok();
        expect(feed2.yield.calledWithExactly(value)).to.be.ok();
      });
    });

    describe('when yield is invoked and one of the chained feeds throws an exception, it', function () {
      beforeEach(function () {
        feed1.yield.throws();
      });

      it('will still call yield on the other chained feeds', function () {
        anEmmitter.yield(value);

        expect(feed2.yield.called).to.be.ok();
      });
    });
  });

  describe('given it is chained to a feed several times', function () {
    var aFeed;
    beforeEach(function () {
      aFeed = doubles.makeFeed();

      anEmmitter.chain(aFeed);
      anEmmitter.chain(aFeed);
      anEmmitter.chain(aFeed);
    });

    it('when yield is invoked, it will still call yield on the chained feed exactly one time', function () {
      anEmmitter.yield(value);

      expect(aFeed.yield.calledOnce).to.be.ok();
    });
  });
});