"use strict";

var expect = require('expect.js'),
    doubles = require('../doubles'),
    chi = require('../../lib/chi');

describe('An Emitter', function () {
  var anEmmitter;

  beforeEach(function () {
    anEmmitter = chi.emitter();
  });

  describe('can yield values', function () {
    it('has a yield() method', function () {
      expect(anEmmitter.yield).to.be.a('function');
    });

    describe('given it is chained to several feeds', function () {
      var feed1, feed2, feed3, value = "yielded value";

      beforeEach(function () {
        feed1 = doubles.makeFeed();
        feed2 = doubles.makeFeed();
        feed3 = doubles.makeFeed();

        anEmmitter.chain(feed1);
        anEmmitter.chain(feed2);
        anEmmitter.chain(feed3);
      });

      describe('when yield is invoked with a value, it', function () {
        beforeEach(function () {
          anEmmitter.yield(value);
        });

        it('will call yield on all chained feeds exactly one time', function () {
          expect(feed1.yield.calledOnce).to.be.ok();
          expect(feed2.yield.calledOnce).to.be.ok();
          expect(feed3.yield.calledOnce).to.be.ok();
        });

        it('will pass the same argument to all chained feeds', function () {
          expect(feed1.yield.calledWithExactly(value)).to.be.ok();
          expect(feed2.yield.calledWithExactly(value)).to.be.ok();
          expect(feed3.yield.calledWithExactly(value)).to.be.ok();
        });
      });

      it('and a feed is chained several times, when yield is invoked with a value, it will still perform exactly one call', function () {
        anEmmitter.chain(feed1);
        anEmmitter.chain(feed1);

        anEmmitter.yield(value);

        expect(feed1.yield.calledOnce).to.be.ok();
      });
    });
  });
});